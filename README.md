![Student_Clearance_System](https://github.com/user-attachments/assets/d9897635-7d65-4272-90cc-755b4a173bce)
A streamlined student clearance system enabling direct communication between students and staff to simplify and accelerate the clearance process.

**Students** place their requests, upload relevant documents, and submit them to the respective **staff** authorized to handle the approval or rejection of that particular level of clearance, namely, project, lab, or library clearance. The **admin**, eg the head of department, oversees the activities of both parties on the system.

### Setup
- Clone the repo in terminal```git clone https://github.com/LINNETWAHOME02/student-clearance.git```
- Enable venv if working in VS code:
```
    python -m venv venv
    venv/Scripts/activate.ps1
```

- Open two terminals/shell and navigate into the frontend ```cd frontend``` and backend ```cd backend``` directories 

- Client (frontend):
    - Install dependencies ```npm install```
    - Start client ```npm run dev```

- Server (backend):
    - Install requirements ```pip install -r requirements.txt```
    - Start server ``` python manage.py runserver```
