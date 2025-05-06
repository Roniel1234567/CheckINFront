import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import MainAppBar from '../components/MainAppBar';


const AboutUs = () => {
  const theme = MUI.useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Principal', icon: <Icons.MenuBook />, path: '/Principal' },
    { text: 'Funcionalidades', icon: <Icons.Person />, path: '/Funcionalidades' },
    { text: 'Guía de Usuario', icon: <Icons.Assessment />, path: '/Guia_usuario' },
  ];

  return (
<MUI.Box sx={{ width:'100vw',display: 'flex', flexDirection: 'column', minHeight: '100vh', alignContent:'center' }}>
<MUI.Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '100vw', overflow: 'hidden' }}>
<MainAppBar />
      </MUI.Box>
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
          <MUI.Card sx={{ borderRadius: '1.5rem',mb: 4 }}>
            <MUI.CardContent>
              <MUI.Typography variant="h4" sx={{color:theme.palette.primary.main, fontWeight:600}} gutterBottom>Sobre Nosotros</MUI.Typography>
            
              <MUI.Typography variant='body1' sx={{textAlign:'justify', color:'black'}}>
             <p>CheckInt In es una app web que busca facilitar por completo el proceso de pasantías y su gestión. La app a la que pueden acceder usuarios como:</p>

              <ul>
              <li>Tutores (Maestro titular de un taller, encargado de comprobar el progreso de sus estudiantes)</li>
              <li>Estudiantes (Se desempeña como pasante en el Centro de Trabajo, es a quien se le evalúa)</li>
              <li>Supervisores (Empleado del centro de trabajo, encargado de evaluar al estudiante y examinarlo)</li>
              <li>Administradores (Cuenta con todos los permisos, tiene la habilidad de ver y editar todos los datos)</li>
              <li>Observadores (Usuario con el unico permiso de observar los datos de la gestión de pasantías)</li>
            </ul>
          </MUI.Typography>
            
            </MUI.CardContent>
          </MUI.Card>

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
  <Footer/>
</MUI.Box>

  );
};

  
  export default AboutUs;