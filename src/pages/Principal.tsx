import React, { useState, useEffect } from 'react';
import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import MainAppBar from '../components/MainAppBar';
import Footer from '../components/Footer';

const Principal = () => {
  const theme = MUI.useTheme();
  const navigate = useNavigate();
  const [showHero, setShowHero] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    setShowHero(true);
    setTimeout(() => setShowCards(true), 500);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menuItems = [
    { 
      text: 'Funcionalidades', 
      icon: <Icons.Dashboard />, 
      path: '/Funcionalidades',
      description: 'Descubre todas las herramientas disponibles',
      color: theme.palette.primary.main,
      mobileIcon: <Icons.Apps />,
      tabletIcon: <Icons.DashboardCustomize />,
      desktopIcon: <Icons.ViewModule />
    },
    { 
      text: 'Sobre Nosotros', 
      icon: <Icons.School />, 
      path: '/Sobre_nosotros',
      description: 'Conoce más sobre nuestra institución',
      color: theme.palette.secondary.main,
      mobileIcon: <Icons.Groups />,
      tabletIcon: <Icons.Business />,
      desktopIcon: <Icons.AccountBalance />
    },
    {
      text: 'Iniciar Sesión',
      icon: <Icons.Login />,
      path: '/Login',
      description: 'Accede a tu cuenta',
      color: theme.palette.primary.dark,
      mobileIcon: <Icons.PersonOutline />,
      tabletIcon: <Icons.AccountCircle />,
      desktopIcon: <Icons.VpnKey />
    }
  ];

  const parallaxOffset = scrollPosition * 0.3;

  return (
    <MUI.Box sx={{ 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      background: '#1a365d',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <MainAppBar />

      {/* Elementos decorativos animados con parallax */}
      {[...Array(5)].map((_, i) => (
        <MUI.Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: '200px', md: '400px' },
            height: { xs: '200px', md: '400px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${MUI.alpha(theme.palette.primary.main, 0.03)} 0%, ${MUI.alpha(theme.palette.primary.main, 0)} 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `translate(-50%, calc(-50% + ${parallaxOffset * (i + 1)}px))`,
            transition: 'transform 0.3s ease-out',
            animation: 'float 30s infinite',
            animationDelay: `${i * 4}s`,
            pointerEvents: 'none',
            zIndex: 0,
            '@keyframes float': {
              '0%, 100%': {
                transform: `translate(-50%, calc(-50% + ${parallaxOffset * (i + 1)}px))`,
              },
              '50%': {
                transform: `translate(-50%, calc(-50% + ${parallaxOffset * (i + 1) + 40}px))`,
              },
            },
          }}
        />
      ))}

      {/* Efecto de estela del cursor mejorado */}
      <MUI.Box
        sx={{
          position: 'fixed',
          width: { xs: '200px', md: '300px' },
          height: { xs: '200px', md: '300px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${MUI.alpha('#F7E8AB', 0.15)} 0%, rgba(255,255,255,0) 70%)`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'all 0.5s ease',
          left: mousePosition.x,
          top: mousePosition.y,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `2px solid ${MUI.alpha('#F7E8AB', 0.1)}`,
            animation: 'pulse 2s infinite',
          },
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(1.5)',
              opacity: 0,
            },
          },
        }}
      />

      <MUI.Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 3 },
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          position: 'relative',
          zIndex: 2,
        }}
      >
        <MUI.Fade in={showHero} timeout={1000}>
          <MUI.Box sx={{ 
            textAlign: 'center', 
            py: { xs: 4, sm: 6, md: 8 },
            px: { xs: 2, sm: 3, md: 4 },
            borderRadius: { xs: '1rem', md: '2rem' },
            background: `linear-gradient(135deg, ${MUI.alpha(theme.palette.primary.main, 0.15)} 0%, ${MUI.alpha(theme.palette.primary.light, 0.2)} 100%)`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            mb: { xs: 4, sm: 5, md: 6 },
            position: 'relative',
            overflow: 'hidden',
            transform: `translateY(${-parallaxOffset * 0.2}px)`,
            transition: 'transform 0.3s ease-out',
          }}>
            <MUI.Typography 
              variant="h1" 
              sx={{ 
                color: '#ffffff',
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                fontWeight: 'bold',
                mb: { xs: 2, sm: 3 },
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  width: '50px',
                  height: '4px',
                  background: '#ffffff',
                  transform: 'translateX(-50%)',
                  borderRadius: '2px',
                }
              }}
            >
              Bienvenido a CHECK<span style={{ color: theme.palette.secondary.main }}>iN</span>T 
            </MUI.Typography>
            <MUI.Typography 
              variant="h5" 
              sx={{ 
                color: '#ffffff',
                mb: { xs: 3, sm: 4 },
                opacity: 0.9,
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }
              }}
            >
              Tu sistema integral de gestión de pasantías
            </MUI.Typography>
            <MUI.Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/Login')}
              sx={{
                py: { xs: 1.5, sm: 2 },
                px: { xs: 4, sm: 6 },
                borderRadius: '2rem',
                fontSize: { xs: '1rem', sm: '1.2rem' },
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                  '&::after': {
                    transform: 'translateX(100%)',
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'transform 0.6s',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Comenzar Ahora
            </MUI.Button>
          </MUI.Box>
        </MUI.Fade>

        <MUI.Container maxWidth="md" sx={{ mb: 6 }}>
          <MUI.Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
            {menuItems.map((item, index) => (
              <MUI.Grid item xs={12} sm={6} md={4} key={item.text}>
                <MUI.Fade in={showCards} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <MUI.Card 
                    onMouseEnter={() => setActiveCard(index)}
                    onMouseLeave={() => setActiveCard(null)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: { xs: '0.75rem', md: '1rem' },
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transform: `translateY(${parallaxOffset * 0.1 * (index + 1)}px)`,
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                        borderColor: 'transparent',
                        background: 'rgba(255, 255, 255, 1)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: item.color,
                        transform: 'scaleX(0)',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover::before': {
                        transform: 'scaleX(1)',
                      },
                    }}
                  >
                    <MUI.CardActionArea 
                      onClick={() => navigate(item.path)}
                      sx={{
                        height: '100%',
                        p: { xs: 3, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'transparent',
                      }}
                    >
                      <MUI.Box 
                        sx={{ 
                          position: 'relative',
                          mb: 2,
                          transform: activeCard === index ? 'scale(1.1)' : 'scale(1)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        <MUI.Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                          {React.cloneElement(item.mobileIcon, { 
                            sx: { 
                              fontSize: '3rem', 
                              color: item.color,
                              transition: 'all 0.3s ease',
                            } 
                          })}
                        </MUI.Box>
                        <MUI.Box sx={{ display: { xs: 'none', sm: 'block', md: 'none' } }}>
                          {React.cloneElement(item.tabletIcon, { 
                            sx: { 
                              fontSize: '3.5rem', 
                              color: item.color,
                              transition: 'all 0.3s ease',
                            } 
                          })}
                        </MUI.Box>
                        <MUI.Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          {React.cloneElement(item.desktopIcon, { 
                            sx: { 
                              fontSize: '4rem', 
                              color: item.color,
                              transition: 'all 0.3s ease',
                            } 
                          })}
                        </MUI.Box>
                      </MUI.Box>
                      <MUI.Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          transition: 'color 0.3s ease',
                          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                        }}
                      >
                        {item.text}
                      </MUI.Typography>
                      <MUI.Typography 
                        color="text.secondary"
                        sx={{
                          opacity: activeCard === index ? 1 : 0.7,
                          transition: 'opacity 0.3s ease',
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {item.description}
                      </MUI.Typography>
                    </MUI.CardActionArea>
                  </MUI.Card>
                </MUI.Fade>
              </MUI.Grid>
            ))}
          </MUI.Grid>
        </MUI.Container>

        <MUI.Fade in={showCards} timeout={1000} style={{ transitionDelay: '800ms' }}>
          <MUI.Box sx={{ 
            mt: { xs: 6, sm: 8 }, 
            textAlign: 'center', 
            color: '#ffffff',
            position: 'relative',
            transform: `translateY(${parallaxOffset * 0.1}px)`,
            transition: 'transform 0.3s ease-out',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '2px',
            }
          }}>
            <MUI.Typography 
              variant="h4" 
              gutterBottom 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Instituto Politécnico Industrial de Santiago
            </MUI.Typography>
            <MUI.Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9, 
                color: '#ffffff',
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
              }}
            >
              Formando profesionales con excelencia académica desde 1970
            </MUI.Typography>
          </MUI.Box>
        </MUI.Fade>
      </MUI.Box>
      <Footer />
    </MUI.Box>
  );
};

export default Principal;
