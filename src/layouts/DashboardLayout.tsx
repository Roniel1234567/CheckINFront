import { useState } from 'react';
import { Box } from '@mui/material';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <DashboardAppBar toggleDrawer={toggleDrawer} />
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerOpen ? 280 : 0}px)` },
          ml: { md: drawerOpen ? '280px' : 0 },
          transition: 'margin 0.2s ease-in-out',
          mt: '64px', // Altura del AppBar
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout; 