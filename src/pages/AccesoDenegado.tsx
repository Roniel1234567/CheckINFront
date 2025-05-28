import { useNavigate } from 'react-router-dom';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";

const AccesoDenegado = () => {
  const navigate = useNavigate();

  return (
    <MUI.Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Icons.Block
        sx={{
          fontSize: 100,
          color: 'error.main',
          mb: 4
        }}
      />
      
      <MUI.Typography variant="h2" component="h1" gutterBottom color="error">
        Acceso Denegado
      </MUI.Typography>
      
      <MUI.Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
        No tienes permisos para acceder a esta página
      </MUI.Typography>

      <MUI.Button
        variant="contained"
        startIcon={<Icons.ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mr: 2 }}
      >
        Volver
      </MUI.Button>

      <MUI.Button
        variant="outlined"
        startIcon={<Icons.Home />}
        onClick={() => navigate('/')}
      >
        Ir al Inicio
      </MUI.Button>
    </MUI.Box>
  );
};

export default AccesoDenegado; 