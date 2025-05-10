import { useState } from "react";
import { Box } from "@mui/material";
import SideBar from "../components/SideBar";
import DashboardAppBar from "../components/DashboardAppBar";
import { Outlet, useNavigate } from "react-router-dom";

const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  // const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* <DashboardAppBar toggleDrawer={toggleDrawer} /> */}
      {/* <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} /> */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          pt: "0px", // altura del AppBar
        
          transition: "padding-left 0.2s ease-in-out",
          width: "100%",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
