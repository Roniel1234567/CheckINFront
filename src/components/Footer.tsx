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
        { text: 'Sobre Nosotros', icon: <Icons.Person />, path: '/Sobre_nosotros' }
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 6px 24px 0 ${MUI.alpha(theme.palette.primary.dark, 0.18)}`,
                borderRadius: '2rem',
                color: theme.palette.background.paper,
                backdropFilter: 'blur(1rem)', 
                padding: { xs: '1.5rem 1rem', md: '2.5rem 3rem' },
                marginTop: '2.5rem',
                width: '95%',
                maxWidth: '100vw',
                mx: 'auto',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <MUI.Grid container spacing={4} alignItems="center">
                    <MUI.Grid item xs={12} md={4}>
                        <MUI.Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: 1 }}>Contacto</MUI.Typography>
                        <MUI.Stack spacing={2}>
                            <MUI.Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icons.LocationOn /> Av. Hispanoamericana, Santiago</MUI.Typography>
                            <MUI.Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icons.Phone /> (809) 247-2000</MUI.Typography>
                            <MUI.Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icons.Email /> info@ipisa.edu.do</MUI.Typography>
                        </MUI.Stack>
                    </MUI.Grid>
                    <MUI.Grid item xs={12} md={4}>
                        <MUI.Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: 1 }}>Enlaces Rápidos</MUI.Typography>
                        <MUI.Stack spacing={1}>
                            {menuItems.map((item) => (
                                <MUI.Typography 
                                    key={item.text} 
                                    sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: theme.palette.secondary.light, textDecoration: 'underline' }, fontWeight: 500, fontSize: '1.1rem' }} 
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.text}
                                </MUI.Typography>
                            ))}
                        </MUI.Stack>
                    </MUI.Grid>
                    <MUI.Grid item xs={12} md={4}>
                        <MUI.Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: 1 }}>Ubicación</MUI.Typography>
                        <MUI.Box sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3, border: `2px solid ${MUI.alpha(theme.palette.primary.dark, 0.2)}` }}>
                            <iframe
                                title="IPISA Location"
                                src="https://www.google.com/maps?q=Av.+Circunvalaci%C3%B3n+468,+Santiago+de+los+Caballeros+51000&output=embed"
                                width="100%"
                                height="180"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </MUI.Box>
                    </MUI.Grid>
                </MUI.Grid>
                <MUI.Divider sx={{ my: 3, bgcolor: 'white', opacity: 0.3 }} />
                <MUI.Typography variant="body2" align="center" sx={{ pb: 2, fontWeight: 400, letterSpacing: 1 }}>
                    © {new Date().getFullYear()} IPISA. Todos los derechos reservados.
                </MUI.Typography>
            </MUI.Box>

            <MUI.Zoom in={showScrollTop}>
                <MUI.Fab 
                    color="primary" 
                    size="small" 
                    aria-label="scroll back to top" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                    sx={{ position: 'fixed', bottom: 24, right: 24, boxShadow: 4 }}
                >
                    <Icons.KeyboardArrowUp />
                </MUI.Fab>
            </MUI.Zoom>
            </footer>
        </>
    );
}

export default Footer;
