import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Footer() {
    const theme = MUI.useTheme();
    const navigate = useNavigate();  
    const [showScrollTop, setShowScrollTop] = useState(false);

    const menuItems = [
        { text: 'Funcionalidades', icon: <Icons.Person />, path: '/Registro_usuario' },
        { text: 'Sobre Nosotros', icon: <Icons.Person />, path: '/Sobre_nosotros' },
        { text: 'Guía de Usuario', icon: <Icons.Assessment />, path: '/Guia_usuario' },
    ];

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    return (
        <>
        <footer>
            <MUI.Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                background: MUI.alpha(theme.palette.primary.main, 1), 
                boxShadow: `0 3px 5px 2px ${MUI.alpha(theme.palette.primary.main, 0.2)}`, 
                borderRadius: '1.5rem',
                color: theme.palette.background.paper,
                backdropFilter: 'blur(1rem)', 
                padding: '1rem',
                marginTop: '1.5rem',
                width: '95%',  // Mismo ancho que el AppBar
                maxWidth: '100vw',  // Mismo maxWidth que el AppBar
                mx: "auto",  // Centrar el footer
            }}>
                <MUI.Grid container spacing={2}>
                    <MUI.Grid item xs={12} md={6}>
                        <MUI.Typography variant="h6">Contacto</MUI.Typography>
                        <MUI.Stack spacing={2}>
                            <MUI.Typography><Icons.LocationOn /> Av. Estrella Sadhalá, Santiago</MUI.Typography>
                            <MUI.Typography><Icons.Phone /> (809) 247-2000</MUI.Typography>
                            <MUI.Typography><Icons.Email /> info@ipisa.edu.do</MUI.Typography>
                        </MUI.Stack>
                    </MUI.Grid>
                    <MUI.Grid item xs={12} md={6}>
                        <MUI.Typography variant="h6">Enlaces Rápidos</MUI.Typography>
                        <MUI.Stack spacing={1}>
                            {menuItems.map((item) => (
                                <MUI.Typography 
                                    key={item.text} 
                                    sx={{ cursor: 'pointer' }} 
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.text}
                                </MUI.Typography>
                            ))}
                        </MUI.Stack>
                    </MUI.Grid>
                </MUI.Grid>
                <MUI.Divider sx={{ my: 2, bgcolor: 'white' }} />
                <MUI.Typography variant="body2" align="center" sx={{ pb: 2 }}>
                    © {new Date().getFullYear()} IPISA. Todos los derechos reservados.
                </MUI.Typography>
            </MUI.Box>

            <MUI.Zoom in={showScrollTop}>
                <MUI.Fab 
                    color="primary" 
                    size="small" 
                    aria-label="scroll back to top" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                    sx={{ position: 'fixed', bottom: 24, right: 24 }}
                >
                    <Icons.KeyboardArrowUp />
                </MUI.Fab>
            </MUI.Zoom>
            </footer>
        </>
    );
}

export default Footer;
