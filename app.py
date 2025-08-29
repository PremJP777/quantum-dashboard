from flask import Flask, jsonify, request
from flask_cors import CORS
from qiskit_ibm_runtime import QiskitRuntimeService
from datetime import datetime, timedelta
import time
import os
import json
import threading
from collections import defaultdict

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Requests for your frontend

# Global variables to store data and avoid hitting IBM API too frequently
cached_data = {}
cached_jobs_data = {}
cached_stats = {}
last_fetch_time = 0
last_jobs_fetch_time = 0
last_stats_fetch_time = 0
FETCH_INTERVAL = 30  # Fetch new data every 30 seconds
JOBS_FETCH_INTERVAL = 60  # Fetch jobs every 60 seconds
STATS_FETCH_INTERVAL = 120  # Fetch stats every 2 minutes

def get_ibm_service():
    """Initialize and return the Qiskit Runtime Service."""
    try:
        token = os.getenv("IBM_QUANTUM_TOKEN")
        if not token:
            raise Exception("IBM_QUANTUM_TOKEN environment variable not set.")
        service = QiskitRuntimeService(channel="ibm_quantum_platform", token=token)
        return service
    except Exception as e:
        print(f"Error initializing QiskitRuntimeService: {e}")
        return None

def calculate_estimated_wait_time(backend, pending_jobs):
    """A simple function to estimate wait time.
    This is a placeholder. You can make this more sophisticated."""
    # A very basic heuristic: assume an average job runtime.
    # You could fetch backend.properties() to get better estimates.
    average_job_time_seconds = 60  # e.g., 1 minute average
    return pending_jobs * average_job_time_seconds

def fetch_recent_jobs():
    """Fetches recent jobs from IBM Quantum."""
    global cached_jobs_data, last_jobs_fetch_time
    service = get_ibm_service()
    if not service:
        cached_jobs_data = {'error': 'Could not initialize QiskitRuntimeService'}
        return

    try:
        # Get recent jobs (last 24 hours)
        limit = 50  # Adjust as needed
        jobs = service.jobs(limit=limit)
        
        jobs_data = []
        for job in jobs:
            job_info = {
                'job_id': job.job_id(),
                'status': job.status().name,
                'backend': job.backend().name if job.backend() else 'Unknown',
                'creation_date': job.creation_date.isoformat() if job.creation_date else None,
                'program_id': getattr(job, 'program_id', 'N/A'),
                'runtime_job': True,
                'queue_position': getattr(job, 'queue_position', None)
            }
            
            # Add execution time if completed
            if hasattr(job, 'metrics') and job.metrics():
                job_info['execution_time'] = job.metrics().get('usage', {}).get('quantum_seconds', None)
            
            jobs_data.append(job_info)
        
        cached_jobs_data = {
            'jobs': jobs_data,
            'total_jobs': len(jobs_data),
            'updated_at': datetime.now().isoformat()
        }
        last_jobs_fetch_time = time.time()
        
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        cached_jobs_data = {'error': str(e)}

def fetch_statistics():
    """Fetches and calculates statistics."""
    global cached_stats, last_stats_fetch_time
    
    if not cached_jobs_data or 'jobs' not in cached_jobs_data:
        return
    
    jobs = cached_jobs_data['jobs']
    stats = {
        'total_jobs': len(jobs),
        'status_distribution': defaultdict(int),
        'backend_distribution': defaultdict(int),
        'hourly_distribution': defaultdict(int),
        'avg_queue_time': 0,
        'updated_at': datetime.now().isoformat()
    }
    
    for job in jobs:
        # Status distribution
        stats['status_distribution'][job['status']] += 1
        
        # Backend distribution
        stats['backend_distribution'][job['backend']] += 1
        
        # Hourly distribution (last 24 hours)
        if job['creation_date']:
            try:
                creation_time = datetime.fromisoformat(job['creation_date'].replace('Z', '+00:00'))
                hour = creation_time.hour
                stats['hourly_distribution'][hour] += 1
            except:
                pass
    
    # Convert defaultdicts to regular dicts for JSON serialization
    stats['status_distribution'] = dict(stats['status_distribution'])
    stats['backend_distribution'] = dict(stats['backend_distribution'])
    stats['hourly_distribution'] = dict(stats['hourly_distribution'])
    
    cached_stats = stats
    last_stats_fetch_time = time.time()
def     fetch_all_data():
    """Fetches data from IBM Quantum, processes it, and stores it in the cache."""
    global cached_data, last_fetch_time
    service = get_ibm_service()
    if not service:
        cached_data = {'error': 'Could not initialize QiskitRuntimeService'}
        return

    try:
        all_backends = service.backends()
        print("Available backends:", [b.name for b in all_backends])
        dashboard_data = {'backends': [], 'updated_at': datetime.now().isoformat()}

        # Track more backends for comprehensive view
        target_backendgit s = [
            'ibm_brisbane', 'ibm_kyiv', 'ibm_osaka', 'ibm_quebec', 
            'ibm_sherbrooke', 'ibm_fez', 'ibm_torino', 'ibm_nazca'
        ]
        
        available_backend_names = [b.name for b in all_backends]
        
        for backend_name in target_backends:
            if backend_name not in available_backend_names:
                continue
                
            try:
                backend = service.backend(backend_name)
                status = backend.status()
                configuration = backend.configuration()

                # Get basic status
                backend_info = {
                    'name': backend.name,
                    'status': status.status_msg,
                    'operational': status.operational,
                    'pending_jobs': status.pending_jobs,
                    'version': getattr(backend, 'version', 'N/A'),
                    'num_qubits': configuration.num_qubits,
                    'max_shots': getattr(configuration, 'max_shots', 'N/A'),
                    'processor_type': getattr(configuration, 'processor_type', 'N/A'),
                }

                # Calculate an estimated wait time
                if status.operational:
                    wait_seconds = calculate_estimated_wait_time(backend, status.pending_jobs)
                    backend_info['estimated_wait_seconds'] = wait_seconds
                    backend_info['estimated_wait_formatted'] = str(timedelta(seconds=wait_seconds))
                else:
                    backend_info['estimated_wait_seconds'] = None
                    backend_info['estimated_wait_formatted'] = 'N/A'

                # Get additional properties if available
                try:
                    properties = backend.properties()
                    if properties:
                        # Get gate error rates
                        gate_errors = []
                        for gate in properties.gates:
                            if hasattr(gate, 'parameters'):
                                for param in gate.parameters:
                                    if param.name == 'gate_error':
                                        gate_errors.append({
                                            'gate': gate.gate,
                                            'qubits': gate.qubits,
                                            'error': param.value
                                        })
                        backend_info['gate_errors'] = gate_errors[:10]  # Limit to first 10
                        
                        # Get readout errors
                        readout_errors = []
                        for qubit, qubit_props in enumerate(properties.qubits):
                            for prop in qubit_props:
                                if prop.name == 'readout_error':
                                    readout_errors.append({
                                        'qubit': qubit,
                                        'error': prop.value
                                    })
                        backend_info['readout_errors'] = readout_errors[:10]  # Limit to first 10
                except Exception as e:
                    print(f"Could not fetch properties for {backend_name}: {e}")
                    backend_info['gate_errors'] = []
                    backend_info['readout_errors'] = []

                dashboard_data['backends'].append(backend_info)

            except Exception as e:
                print(f"Error fetching data for {backend_name}: {e}")
                # Append error info so frontend can display it
                dashboard_data['backends'].append({'name': backend_name, 'error': str(e)})

        cached_data = dashboard_data
        last_fetch_time = time.time()
        
    except Exception as e:
        print(f"Error in fetch_all_data: {e}")
        cached_data = {'error': str(e)}

@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """The main API endpoint your frontend will call."""
    global last_fetch_time
    current_time = time.time()

    # Only fetch new data if the cache is stale
    if current_time - last_fetch_time > FETCH_INTERVAL or not cached_data:
        print("Fetching new data from IBM Quantum...")
        print("Hello")
        fetch_all_data()
    else:
        print("Hello World")
        print("Returning cached data.")

    return jsonify(cached_data)

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    """API endpoint to get recent jobs."""
    global last_jobs_fetch_time
    current_time = time.time()

    if current_time - last_jobs_fetch_time > JOBS_FETCH_INTERVAL or not cached_jobs_data:
        print("Fetching recent jobs...")
        fetch_recent_jobs()
    else:
        print("Returning cached jobs data.")

    return jsonify(cached_jobs_data)

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """API endpoint to get job statistics."""
    global last_stats_fetch_time
    current_time = time.time()

    if current_time - last_stats_fetch_time > STATS_FETCH_INTERVAL or not cached_stats:
        print("Calculating statistics...")
        fetch_statistics()
    else:
        print("Returning cached statistics.")

    return jsonify(cached_stats)

@app.route('/api/refresh', methods=['POST'])
def refresh_data():
    """Force refresh all data."""
    fetch_all_data()
    fetch_recent_jobs()
    fetch_statistics()
    return jsonify({'message': 'Data refreshed successfully'})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'cache_ages': {
            'backends': time.time() - last_fetch_time if last_fetch_time else 'never',
            'jobs': time.time() - last_jobs_fetch_time if last_jobs_fetch_time else 'never',
            'stats': time.time() - last_stats_fetch_time if last_stats_fetch_time else 'never'
        }
    })

if __name__ == '__main__':
    # Pre-fetch data on startup in a separate thread to avoid blocking
    def initial_data_fetch():
        time.sleep(2)  # Give Flask time to start
        fetch_all_data()
        fetch_recent_jobs()
        fetch_statistics()
    
    threading.Thread(target=initial_data_fetch, daemon=True).start()
    
    # Run the Flask server
    app.run(debug=True, host='0.0.0.0', port=5000)