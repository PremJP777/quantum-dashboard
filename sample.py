import os
from qiskit import QuantumCircuit
from qiskit_ibm_runtime import QiskitRuntimeService

token = os.getenv("IBM_QUANTUM_TOKEN")
service = QiskitRuntimeService(
    channel="ibm_quantum_platform",
    token=token
)
backends_info = []
for backend in service.backends():
    backends_info.append({
        "name": backend.name,
        "status": backend.status().to_dict(),  # Online / Not
        "num_qubits": backend.num_qubits,
        "queue_length": backend.status().pending_jobs
    })
print(backends_info)

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

backend = service.backend("ibmq_qasm_simulator")  # free simulator
job = service.run(qc, backend=backend)
print({"job_id": job.job_id(),
        "backend": backend.name,
        "status": str(job.status())})

