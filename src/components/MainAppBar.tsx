import '../styles/index.scss';
import { useState } from 'react';
import { To, useNavigate, useLocation } from 'react-router-dom';
import Logotipo from '../assets/svg/Logotipo';

import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';

function MainAppBar() {
    const theme = MUI.useTheme();
    const location = useLocation();
    const isMobile = MUI.useMediaQuery(theme.breakpoints.down('sm'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
      { text: 'Principal', icon: <Icons.Home />, path: '/' },
      { text: 'Funcionalidades', icon: <Icons.School />, path: '/Funcionalidades' },
      { text: 'Sobre Nosotros', icon: <Icons.Person />, path: '/SobreNosotros' },
      { text: 'Manual de Usuario', icon: <Icons.Assessment />, path: '/ManualdeUsuario' },
    ];

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const handleNavigation = (path: To) => {
        navigate(path);
        if (isMobile) setDrawerOpen(false);
    };

    return (
      <MUI.Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '100vw', overflow: 'hidden' }}>
        <MUI.AppBar 
          position="fixed"
          sx={{ 
            background: MUI.alpha(theme.palette.background.paper, 0.6),
            boxShadow: `0 3px 5px 2px ${MUI.alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: '1.5rem',
            margin: '1rem auto',
            width: '95%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: theme.palette.text.primary,
            backdropFilter: 'blur(1rem)',
          }}
        >
          <MUI.Toolbar>
            <MUI.Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Logotipo height={35} />
              </MUI.Box>
              
              <MUI.Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                {menuItems.map((item) => (
                  <MUI.Button 
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    variant={location.pathname === item.path ? "contained" : "text"}
                    color="primary" 
                    sx={{ 
                      minWidth: 'fit-content', 
                      px: 2,
                      ...(location.pathname === item.path && {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      })
                    }}
                  >
                    <MUI.Typography color={location.pathname === item.path ? "inherit" : "primary"}>
                      {item.text}
                    </MUI.Typography>
                  </MUI.Button>
                ))}
              </MUI.Box>
  
              <MUI.Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <MUI.IconButton color="inherit" aria-label="menu" onClick={toggleDrawer}>
                  <Icons.Menu />
                </MUI.IconButton>
              </MUI.Box>
            </MUI.Box>
          </MUI.Toolbar>
  
          <MUI.Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: 280,
                background: MUI.alpha(theme.palette.background.paper, 0.9),
                boxShadow: `0 3px 5px 2px ${MUI.alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: '1.5rem 0 0 1.5rem',
                mt: '1rem',
                height: 'calc(100% - 2rem)'
              }
            }}
          >
            <MUI.List sx={{ pt: 2 }}>
              {menuItems.map((item) => (
                <MUI.Box key={item.text}>
                  <MUI.ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      py: 1.5,
                      borderRadius: 1.5,
                      mb: 0.5,
                      backgroundColor: location.pathname === item.path 
                        ? MUI.alpha(theme.palette.primary.main, 0.2) 
                        : 'transparent',
                      '&:hover': { 
                        backgroundColor: location.pathname === item.path 
                          ? MUI.alpha(theme.palette.primary.main, 0.3)
                          : MUI.alpha(theme.palette.primary.main, 0.08) 
                      }
                    }}
                  >
                    <MUI.ListItemIcon sx={{ 
                      minWidth: 40, 
                      color: location.pathname === item.path 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary 
                    }}>
                      {item.icon}
                    </MUI.ListItemIcon>
                    <MUI.ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        sx: { 
                          fontSize: '0.9rem', 
                          color: location.pathname === item.path 
                            ? theme.palette.primary.main 
                            : theme.palette.text.secondary, 
                          fontWeight: 500 
                        } 
                      }}
                    />
                  </MUI.ListItemButton>
                </MUI.Box>
              ))}
            </MUI.List>
          </MUI.Drawer>
        </MUI.AppBar>
      </MUI.Box>
    );
  }
  
  export default MainAppBar;