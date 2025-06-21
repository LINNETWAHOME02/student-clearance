INSERT INTO accounts_clearancetype(clearance_type) VALUES
    ('project'), ('lab'), ('library');

-- 20 valid students
INSERT INTO accounts_validstudent (
  enrollment_number, university_email, name, department, course, year, semester, 
  admission_date, expected_graduation, gpa, credits, phone, avatar, bio, status
) VALUES
('ENR001', 'student1@university.edu', 'Alice Mwangi', 'Computer Science', 'Computer Science BSc', 2, '4', '2024-09-01', '2028-09-01', 3.24, '86', '+254712341000', 'avatars/enr001.jpg', 'Bio for Alice Mwangi.', 'active'),
('ENR002', 'student2@university.edu', 'John Doe', 'Physics', 'Physics BSc', 3, '6', '2023-09-01', '2027-09-01', 2.88, '92', '+254712341001', 'avatars/enr002.jpg', 'Bio for John Doe.', 'active'),
('ENR003', 'student3@university.edu', 'Jane Doe', 'Math', 'Mathematics BSc', 4, '8', '2022-09-01', '2026-09-01', 3.52, '108', '+254712341002', 'avatars/enr003.jpg', 'Bio for Jane Doe.', 'active'),
('ENR004', 'student4@university.edu', 'Mark Smith', 'Engineering', 'Mechanical Engineering BSc', 1, '2', '2025-01-01', '2029-01-01', 2.75, '63', '+254712341003', 'avatars/enr004.jpg', 'Bio for Mark Smith.', 'active'),
('ENR005', 'student5@university.edu', 'Linda Brown', 'Biology', 'Biological Sciences BSc', 2, '4', '2024-09-01', '2028-09-01', 3.10, '81', '+254712341004', 'avatars/enr005.jpg', 'Bio for Linda Brown.', 'active'),
('ENR006', 'student6@university.edu', 'Emma Johnson', 'Chemistry', 'Chemistry BSc', 1, '2', '2025-01-01', '2029-01-01', 2.94, '57', '+254712341005', 'avatars/enr006.jpg', 'Bio for Emma Johnson.', 'active'),
('ENR007', 'student7@university.edu', 'Noah Kim', 'Physics', 'Applied Physics BSc', 3, '5', '2023-09-01', '2027-09-01', 3.33, '90', '+254712341006', 'avatars/enr007.jpg', 'Bio for Noah Kim.', 'active'),
('ENR008', 'student8@university.edu', 'Liam Lee', 'Computer Science', 'Computer Science BSc', 2, '4', '2024-09-01', '2028-09-01', 2.70, '76', '+254712341007', 'avatars/enr008.jpg', 'Bio for Liam Lee.', 'active'),
('ENR009', 'student9@university.edu', 'Sophia Patel', 'Engineering', 'Electrical Engineering BSc', 4, '7', '2022-09-01', '2026-09-01', 3.67, '112', '+254712341008', 'avatars/enr009.jpg', 'Bio for Sophia Patel.', 'active'),
('ENR010', 'student10@university.edu', 'James Williams', 'Math', 'Pure Mathematics BSc', 1, '2', '2025-01-01', '2029-01-01', 2.81, '60', '+254712341009', 'avatars/enr010.jpg', 'Bio for James Williams.', 'active');


-- Valid staff
INSERT INTO accounts_validstaff (
  staff_id, university_email, name, department, clearance_type_id, role, phone, avatar, bio, position, status
) VALUES
('STF001', 'staff1@university.edu', 'Jane Staff', 'Library', 3, 'staff', '+254700100001', 'avatars/stf001.jpg', 'Bio for Jane Staff.', 'Library Assistant', 'active'),
('STF002', 'staff2@university.edu', 'Mark Supervisor', 'Engineering', 1, 'staff', '+254700100002', 'avatars/stf002.jpg', 'Bio for Mark Supervisor.', 'Project Supervisor', 'active'),
('STF003', 'staff3@university.edu', 'Lucy Lab', 'Science Lab', 2, 'staff', '+254700100003', 'avatars/stf003.jpg', 'Bio for Lucy Lab.', 'Lab Technician', 'active'),
('STF004', 'staff4@university.edu', 'Paul Library', 'Library', 3, 'staff', '+254700100004', 'avatars/stf004.jpg', 'Bio for Paul Library.', 'Senior Librarian', 'active'),
('STF005', 'staff5@university.edu', 'Anna Project', 'Engineering', 1, 'staff', '+254700100005', 'avatars/stf005.jpg', 'Bio for Anna Project.', 'Clearance Officer', 'active'),
('STF006', 'staff6@university.edu', 'Steve Lab', 'Science Lab', 2, 'staff', '+254700100006', 'avatars/stf006.jpg', 'Bio for Steve Lab.', 'Lab Supervisor', 'active'),
('STF007', 'staff7@university.edu', 'Mary Library', 'Library', 3, 'staff', '+254700100007', 'avatars/stf007.jpg', 'Bio for Mary Library.', 'Library Clerk', 'active'),
('STF008', 'staff8@university.edu', 'James Project', 'Engineering', 1, 'staff', '+254700100008', 'avatars/stf008.jpg', 'Bio for James Project.', 'Intern Supervisor', 'active'),
('STF009', 'staff9@university.edu', 'Pat Lab', 'Science Lab', 2, 'staff', '+254700100009', 'avatars/stf009.jpg', 'Bio for Pat Lab.', 'Safety Officer', 'active'),
('STF010', 'staff10@university.edu', 'Nina Library', 'Library', 3, 'staff', '+254700100010', 'avatars/stf010.jpg', 'Bio for Nina Library.', 'Reference Librarian', 'active'),

('ADM001', 'admin_comp@university.edu', 'Comp Sci Admin', 'Computing Department', NULL, 'admin', '+254700200001', 'avatars/adm001.jpg', 'Bio for Comp Sci Admin.', 'Head of Department', 'active'),
('ADM002', 'admin_chem@university.edu', 'Chemistry Admin', 'Chemistry Department', NULL, 'admin', '+254700200002', 'avatars/adm002.jpg', 'Bio for Chemistry Admin.', 'Dean of Faculty', 'active'),
('ADM003', 'admin_eng@university.edu', 'Engineering Admin', 'Engineering Department', NULL, 'admin', '+254700200003', 'avatars/adm003.jpg', 'Bio for Engineering Admin.', 'Department Chair', 'active'),
('ADM004', 'admin_bio@university.edu', 'Biology Admin', 'Biology Department', NULL, 'admin', '+254700200004', 'avatars/adm004.jpg', 'Bio for Biology Admin.', 'Academic Coordinator', 'active'),
('ADM005', 'admin_math@university.edu', 'Mathematics Admin', 'Mathematics Department', NULL, 'admin', '+254700200005', 'avatars/adm005.jpg', 'Bio for Mathematics Admin.', 'Systems Admin', 'active');