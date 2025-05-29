import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import MainAppBar from '../components/MainAppBar';
import Footer from '../components/Footer';

const Principal = () => {
  const theme = MUI.useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Funcionalidades', icon: <Icons.Person />, path: '/Funcionalidades' },
    { text: 'Sobre Nosotros', icon: <Icons.Note />, path: '/Sobre_nosotros' }
  ];

  return (
<MUI.Box sx={{ width:'100vw',display: 'flex', flexDirection: 'column', minHeight: '100vh', alignContent:'center' }}>
  <MainAppBar />

  <MUI.Box
    component="main"
    sx={{
      flexGrow: 1,
      mt: 12,
      px: 3,
      width: "95%", // Igual al AppBar
      maxWidth: "100vw", // Mismo máximo del AppBar
      mx: "auto", // Para centrarlo
    }}
  >
    <MUI.Grid container spacing={4}>
      <MUI.Grid item xs={12}>
        <MUI.Paper elevation={3} sx={{ borderRadius:'1rem', textAlign: 'center', p: 5, bgcolor: theme.palette.primary.main }}>
          <MUI.Typography variant="h2" sx={{ color: 'white' }}>Bienvenido a tu sistema de gestión de pasantías</MUI.Typography>
          <MUI.Typography variant="h5" sx={{ color: 'white', mt: 2 }}>Gestiona tus pasantías de manera eficiente y profesional</MUI.Typography>
          <MUI.Button variant="contained" color="secondary" size="large" sx={{ mt: 3 }} onClick={() => navigate('/Login')}>
            Comenzar Ahora
          </MUI.Button>
        </MUI.Paper>
      </MUI.Grid>

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
  <Footer/>
</MUI.Box>

  );
};

export default Principal;
