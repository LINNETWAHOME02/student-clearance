import React from "react";
import Layout from "../../layout/Layout";
import Banner from "./Banner";

const StudentDashboard = () => {
  return (
    <Layout>
      <div className="p-2 w-full overflow-y-auto">
        <h1 className="text-center text-2xl font-bold mb-4">
          Welcome to your Student Dashboard
        </h1>
        <Banner />
      </div>
    </Layout>
  );
};

export default StudentDashboard;
