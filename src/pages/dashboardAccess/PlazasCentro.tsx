/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';

// Interfaces
interface Plaza {
  id: number;
  centro: {
    id: number;
    nombre: string;
    direccion: string;
  };
  taller: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  plazas: number;
  fechaCreacion: string;
}

function PlazasCentro() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [plazas, setPlazas] = useState<Plaza[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlaza, setSelectedPlaza] = useState<Plaza | null>(null);
  const notifications = 4;

  // Simulación de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlazas([
        {
          id: 1,
          centro: {
            id: 1,
            nombre: 'Centro Industrial A',
            direccion: 'Av. Principal 123'
          },
          taller: {
            id: 1,
            nombre: 'Taller de Mecánica',
            descripcion: 'Especializado en mantenimiento industrial'
          },
          plazas: 5,
          fechaCreacion: '2024-03-15'
        },
        {
          id: 2,
          centro: {
            id: 2,
            nombre: 'Centro Tecnológico B',
            direccion: 'Calle Secundaria 456'
          },
          taller: {
            id: 2,
            nombre: 'Taller de Electrónica',
            descripcion: 'Enfocado en circuitos y sistemas digitales'
          },
          plazas: 3,
          fechaCreacion: '2024-03-14'
        }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenDialog = (plaza?: Plaza) => {
    if (plaza) {
      setSelectedPlaza(plaza);
    } else {
      setSelectedPlaza(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlaza(null);
  };

  const filteredPlazas = plazas.filter(plaza => 
    plaza.centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plaza.taller.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* App bar */}
        <DashboardAppBar notifications={notifications} toggleDrawer={toggleDrawer} />

        {/* Loading overlay */}
        {loading && (
          <MUI.Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.8)',
            zIndex: 9999
          }}>
            <MUI.CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </MUI.Box>
        )}

        {/* Encabezado */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Icons.BusinessCenter sx={{ fontSize: '2.5rem' }} />
            Plazas de Centros de Trabajo
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Gestiona las plazas disponibles en los centros de trabajo y talleres
          </MUI.Typography>
        </MUI.Box>

        {/* Barra de Acciones */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <MUI.TextField
            placeholder="Buscar centro o taller..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <MUI.Button
            variant="contained"
            color="primary"
            startIcon={<Icons.Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            Nueva Plaza
          </MUI.Button>
        </MUI.Box>

        {/* Grid de Plazas */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Grid container spacing={3}>
            {filteredPlazas.map((plaza) => (
              <MUI.Grid item xs={12} md={6} key={plaza.id}>
                <MUI.Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <MUI.Box>
                      <MUI.Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Icons.Business sx={{ color: theme.palette.primary.main }} />
                        {plaza.centro.nombre}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icons.LocationOn sx={{ fontSize: '1rem' }} />
                        {plaza.centro.direccion}
                      </MUI.Typography>
                    </MUI.Box>
                    <MUI.Chip
                      label={`${plaza.plazas} plazas`}
                      color="primary"
                      icon={<Icons.People />}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  </MUI.Box>

                  <MUI.Divider sx={{ my: 2 }} />

                  <MUI.Box sx={{ mb: 2 }}>
                    <MUI.Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Icons.Build sx={{ color: theme.palette.secondary.main }} />
                      {plaza.taller.nombre}
                    </MUI.Typography>
                    <MUI.Typography variant="body2" color="text.secondary">
                      {plaza.taller.descripcion}
                    </MUI.Typography>
                  </MUI.Box>

                  <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <MUI.Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Icons.CalendarToday sx={{ fontSize: '0.875rem' }} />
                      Creado: {new Date(plaza.fechaCreacion).toLocaleDateString()}
                    </MUI.Typography>
                    <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                      <MUI.IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(plaza)}
                        sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: MUI.alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Icons.Edit />
                      </MUI.IconButton>
                      <MUI.IconButton
                        color="error"
                        sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: MUI.alpha(theme.palette.error.main, 0.1)
                          }
                        }}
                      >
                        <Icons.Delete />
                      </MUI.IconButton>
                    </MUI.Box>
                  </MUI.Box>
                </MUI.Paper>
              </MUI.Grid>
            ))}
          </MUI.Grid>
        </MUI.Box>

        {/* Diálogo de Creación/Edición */}
        <MUI.Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          TransitionComponent={MUI.Slide}
          TransitionProps={{ direction: 'up' }}
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              overflow: 'auto'
            }
          }}
        >
          <MUI.DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.BusinessCenter sx={{ color: 'white' }} />
              <MUI.Typography variant="h6">
                {selectedPlaza ? 'Editar Plaza' : 'Nueva Plaza'}
              </MUI.Typography>
            </MUI.Box>
            <MUI.IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <Icons.Close />
            </MUI.IconButton>
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2, pb: 4 }}>
            <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Centro de Trabajo</MUI.InputLabel>
                <MUI.Select
                  label="Centro de Trabajo"
                  defaultValue={selectedPlaza?.centro.id || ''}
                >
                  <MUI.MenuItem value={1}>Centro Industrial A</MUI.MenuItem>
                  <MUI.MenuItem value={2}>Centro Tecnológico B</MUI.MenuItem>
                </MUI.Select>
              </MUI.FormControl>

              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Taller</MUI.InputLabel>
                <MUI.Select
                  label="Taller"
                  defaultValue={selectedPlaza?.taller.id || ''}
                >
                  <MUI.MenuItem value={1}>Taller de Mecánica</MUI.MenuItem>
                  <MUI.MenuItem value={2}>Taller de Electrónica</MUI.MenuItem>
                </MUI.Select>
              </MUI.FormControl>

              <MUI.TextField
                label="Número de Plazas"
                type="number"
                variant="outlined"
                fullWidth
                defaultValue={selectedPlaza?.plazas || ''}
                InputProps={{
                  startAdornment: (
                    <MUI.Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Icons.People sx={{ color: 'text.secondary' }} />
                    </MUI.Box>
                  ),
                  inputProps: { min: 1 }
                }}
              />
            </MUI.Box>
          </MUI.DialogContent>
          <MUI.DialogActions sx={{ 
            p: 2, 
            borderTop: `1px solid ${theme.palette.divider}`,
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            zIndex: 1
          }}>
            <MUI.Button 
              onClick={handleCloseDialog}
              startIcon={<Icons.Close />}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              color="primary"
              startIcon={<Icons.Save />}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              Guardar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
      </MUI.Box>
    </MUI.Box>
  );
}

export default PlazasCentro; 