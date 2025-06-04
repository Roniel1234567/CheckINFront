import React, { useEffect, useState } from 'react';
import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';

function Footer() {
    const theme = MUI.useTheme();
    const navigate = useNavigate();  
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

    const menuItems = [
        { 
            text: 'Funcionalidades', 
            icon: <Icons.AutoGraph />, 
            path: '/Funcionalidades',
            description: 'Explora nuestras herramientas'
        },
        { 
            text: 'Sobre Nosotros', 
            icon: <Icons.School />, 
            path: '/Sobre_nosotros',
            description: 'Conoce nuestra historia'
        }
    ];

    const contactInfo = [
        { 
            icon: <Icons.LocationOn />, 
            text: 'Av. Hispanoamericana, Santiago',
            id: 'location'
        },
        { 
            icon: <Icons.Phone />, 
            text: '(809) 247-2000',
            id: 'phone'
        },
        { 
            icon: <Icons.Email />, 
            text: 'info@ipisa.edu.do',
            id: 'email'
        }
    ];

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    return (
        <footer>
            <MUI.Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                background: '#ffffff',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
                color: theme.palette.text.primary,
                padding: { xs: '3rem 1rem', md: '4rem 3rem 2rem' },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
            }}>
                <MUI.Container maxWidth="lg">
                    <MUI.Grid container spacing={4}>
                        <MUI.Grid xs={12} md={4}>
                            <MUI.Box sx={{ mb: 3 }}>
                                <MUI.Typography variant="h5" sx={{ 
                                    fontWeight: 700, 
                                    mb: 1,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                }}>
                                    Contacto
                                </MUI.Typography>
                                <MUI.Divider sx={{ width: '60px', height: '4px', background: theme.palette.primary.main, mb: 3 }} />
                            </MUI.Box>
                            <MUI.Stack spacing={2}>
                                {contactInfo.map((info) => (
                                    <MUI.Box
                                        key={info.id}
                                        onMouseEnter={() => setHoveredIcon(info.id)}
                                        onMouseLeave={() => setHoveredIcon(null)}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2,
                                            transition: 'transform 0.3s ease',
                                            transform: hoveredIcon === info.id ? 'translateX(10px)' : 'none',
                                        }}
                                    >
                                        <MUI.Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 40,
                                                height: 40,
                                                borderRadius: '12px',
                                                background: hoveredIcon === info.id ? 
                                                    `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 
                                                    'rgba(0, 0, 0, 0.05)',
                                                transition: 'all 0.3s ease',
                                                color: hoveredIcon === info.id ? '#fff' : theme.palette.text.primary,
                                            }}
                                        >
                                            {React.cloneElement(info.icon, { 
                                                sx: { fontSize: '1.5rem' }
                                            })}
                                        </MUI.Box>
                                        <MUI.Typography 
                                            sx={{ 
                                                transition: 'color 0.3s ease',
                                                color: hoveredIcon === info.id ? theme.palette.primary.main : 'inherit',
                                            }}
                                        >
                                            {info.text}
                                        </MUI.Typography>
                                    </MUI.Box>
                                ))}
                            </MUI.Stack>
                        </MUI.Grid>

                        <MUI.Grid xs={12} md={4}>
                            <MUI.Box sx={{ mb: 3 }}>
                                <MUI.Typography variant="h5" sx={{ 
                                    fontWeight: 700, 
                                    mb: 1,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                }}>
                                    Enlaces Rápidos
                                </MUI.Typography>
                                <MUI.Divider sx={{ width: '60px', height: '4px', background: theme.palette.primary.main, mb: 3 }} />
                            </MUI.Box>
                            <MUI.Stack spacing={2}>
                                {menuItems.map((item) => (
                                    <MUI.Box
                                        key={item.text}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            cursor: 'pointer',
                                            p: 2,
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'rgba(0, 0, 0, 0.05)',
                                                transform: 'translateX(10px)',
                                            }
                                        }}
                                    >
                                        <MUI.Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                fontWeight: 600,
                                                mb: 0.5
                                            }}
                                        >
                                            {item.text}
                                        </MUI.Typography>
                                        <MUI.Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                        >
                                            {item.description}
                                        </MUI.Typography>
                                    </MUI.Box>
                                ))}
                            </MUI.Stack>
                        </MUI.Grid>

                        <MUI.Grid xs={12} md={4}>
                            <MUI.Box sx={{ mb: 3 }}>
                                <MUI.Typography variant="h5" sx={{ 
                                    fontWeight: 700, 
                                    mb: 1,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                }}>
                                    Ubicación
                                </MUI.Typography>
                                <MUI.Divider sx={{ width: '60px', height: '4px', background: theme.palette.primary.main, mb: 3 }} />
                            </MUI.Box>
                            <MUI.Box 
                                sx={{ 
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    border: '4px solid #fff',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                                    }
                                }}
                            >
                                <iframe
                                    title="IPISA Location"
                                    src="https://www.google.com/maps?q=Av.+Circunvalaci%C3%B3n+468,+Santiago+de+los+Caballeros+51000&output=embed"
                                    width="100%"
                                    height="250"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </MUI.Box>
                        </MUI.Grid>
                    </MUI.Grid>

                    <MUI.Box 
                        sx={{ 
                            mt: 6, 
                            pt: 3, 
                            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }}
                    >
                        <MUI.Typography 
                            variant="body2" 
                            sx={{ 
                                opacity: 0.8,
                                fontWeight: 500
                            }}
                        >
                            © {new Date().getFullYear()} IPISA. Todos los derechos reservados.
                        </MUI.Typography>
                    </MUI.Box>
                </MUI.Container>
            </MUI.Box>

            <MUI.Zoom in={showScrollTop}>
                <MUI.Fab 
                    color="primary" 
                    size="medium"
                    aria-label="scroll back to top" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 24, 
                        right: 24, 
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        }
                    }}
                >
                    <Icons.KeyboardArrowUp />
                </MUI.Fab>
            </MUI.Zoom>
        </footer>
    );
}

export default Footer;
