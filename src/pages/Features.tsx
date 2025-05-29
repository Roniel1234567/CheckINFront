/* eslint-disable @typescript-eslint/no-unused-vars */
import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import Footer from '../components/Footer';
import { useState } from 'react';
import { To, useNavigate } from 'react-router-dom';
import MainAppBar from '../components/MainAppBar';

const Features = () => {
  const theme = MUI.useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Principal', icon: <Icons.MenuBook />, path: '/Principal' },
    { text: 'Sobre Nosotros', icon: <Icons.Note />, path: '/Sobre_nosotros' }
  ];

  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleNavigation = (path: To) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  // Definir las tarjetas del dashboard
  const dashboardCards = [
    { 
      title: 'Maneja al Estudiante', 
      icon: <Icons.GroupAdd fontSize="large" />, 
      color: theme.palette.primary.light, 
      description: 'Asigna, aprueba, marca la asistencia y evalúa el desempeño en pasantías',
    },
    { 
      title: 'Maneja al Centro', 
      icon: <Icons.Business fontSize="large" />, 
      color: theme.palette.primary.light, 
      description: 'Crea y gestiona centros de pasantías, asigna tutores y revisa el desempeño',
    },
    { 
      title: 'Maneja las Pasantías', 
      icon: <Icons.Work fontSize="large" />, 
      color: theme.palette.primary.light, 
      description: 'Visualiza las horas de pasantía, asígnalas e imprime reportes'
    },
    { 
      title: 'Crea Reportes', 
      icon: <Icons.Description fontSize="large" />, 
      color: theme.palette.primary.light, 
      description: 'Imprime y comparte los datos de las pasantías, los estudiantes y los centros'
    },
  ];

  return (
    <MUI.Box sx={{ width: '100vw', display: 'flex', flexDirection: 'column', minHeight: '100vh', alignContent: 'center' }}>
      <MUI.Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '100vw', overflow: 'hidden' }}>
      <MainAppBar />
      </MUI.Box>

      <MUI.Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 12,
          px: 3,
          width: "95%",
          maxWidth: "100vw",
          mx: "auto",
        }}
      >
        <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardCards.map((card, index) => (
            <MUI.Grid item xs={12} sm={6} md={3} key={index}>
              <MUI.Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                    cursor: 'pointer'
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <MUI.Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    width: 80, 
                    height: 80, 
                    background: MUI.alpha(theme.palette.secondary.main, 0.3),
                    borderRadius: '0 0 0 100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    p: 1,
                    color: card.color
                  }}
                >
                  {card.icon}
                </MUI.Box>
                <MUI.CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <MUI.Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    {card.title}
                  </MUI.Typography>
                  <MUI.Typography variant="body2" color="text.secondary">
                    {card.description}
                  </MUI.Typography>
                  <MUI.Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    color: card.color, 
                    '&:hover': { textDecoration: 'underline' } 
                  }}>
                  </MUI.Box>
                </MUI.CardContent>
              </MUI.Card>
            </MUI.Grid>
          ))}
        </MUI.Grid>

        <MUI.Grid container spacing={4}>
          <MUI.Grid item xs={12} md={6}>
            <MUI.Zoom in timeout={1000}>
              <MUI.Card>
                <MUI.CardMedia
                  component="img"
                  image="https://lh3.googleusercontent.com/p/AF1QipMMd3JDNQw__L4_ySsjYmnlA5IowqB-8tB9hT5z=s1360-w1360-h1020"
                  alt="IPISA Building"
                  sx={{ height: 200 }}
                />
                <MUI.CardContent>
                  <MUI.Typography variant="h5">Sobre IPISA</MUI.Typography>
                  <MUI.Typography>El Instituto Politécnico Industrial de Santiago es una institución educativa comprometida con la excelencia académica.</MUI.Typography>
                </MUI.CardContent>
              </MUI.Card>
            </MUI.Zoom>
          </MUI.Grid>

          <MUI.Grid item xs={12} md={6}>
            <MUI.Zoom in timeout={1000} style={{ transitionDelay: '400ms' }}>
              <MUI.Card>
                <MUI.CardContent>
                  <MUI.Typography variant="h5" gutterBottom>Accesos Rápidos</MUI.Typography>
                  <MUI.List>
                    {menuItems.map((item) => (
                      <MUI.ListItemButton key={item.text} onClick={() => navigate(item.path)}>
                        <MUI.ListItemIcon>{item.icon}</MUI.ListItemIcon>
                        <MUI.ListItemText primary={item.text} />
                      </MUI.ListItemButton>
                    ))}
                  </MUI.List>
                </MUI.CardContent>
              </MUI.Card>
            </MUI.Zoom>
          </MUI.Grid>
        </MUI.Grid>
      </MUI.Box>
      
      <Footer />
    </MUI.Box>
  );
};

export default Features;