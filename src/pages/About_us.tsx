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
    { text: 'Funcionalidades', icon: <Icons.Person />, path: '/Funcionalidades' }
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
                CheckInt In es una aplicación web diseñada para optimizar y digitalizar por completo el proceso de gestión de pasantías. Ofrece una plataforma centralizada donde las distintas personas involucradas —desde instituciones educativas hasta centros de trabajo— pueden interactuar de forma eficiente y estructurada.
                <br /><br />
                La app permite dar seguimiento al progreso de los pasantes, realizar evaluaciones, coordinar actividades y mantener un registro claro y accesible de todo el proceso de práctica profesional. Su enfoque está en simplificar la comunicación, supervisión y documentación, asegurando que cada etapa de la pasantía se desarrolle de manera fluida y transparente.
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