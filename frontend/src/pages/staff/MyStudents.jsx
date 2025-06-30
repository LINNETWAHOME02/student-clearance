import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { useAuth } from "../../context/AuthProvider";
import { UserCheck, UserX } from "lucide-react";

const MyStudents = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getClearanceTypeId = () => {
    // If the clearance_type is stored as number directly
    return user?.clearance_type;
  };

  useEffect(() => {
    const fetchStudents = async () => {
      const clearanceType = getClearanceTypeId();
      if (!clearanceType) {
        setError("No clearance type assigned.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8000/clearance/assigned-students/?clearance_type=${clearanceType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch students");
        }

        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, user]);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className=" text-center text-2xl font-bold text-gray-800">My Assigned Students</h1>
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm border border-blue-200 shadow-sm">
            Total: {students.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading students...</p>
        ) : error ? (
          <div className="text-red-600 font-medium">{error}</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500">No assigned students found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full bg-white text-sm text-gray-800">
              <thead className="bg-gray-100 text-left font-semibold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">ID Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Account Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4">{student.id_number || "N/A"}</td>
                    <td className="px-6 py-4">{student.department || "N/A"}</td>
                    <td className="px-6 py-4">
                      {student.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                          <UserCheck className="w-4 h-4" /> Activated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-600 font-semibold">
                          <UserX className="w-4 h-4" /> Not Activated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyStudents;