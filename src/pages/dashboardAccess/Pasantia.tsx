import { useReadOnlyMode } from '../../hooks/useReadOnlyMode';
import { Button, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function PasantiaPage() {
  const isReadOnly = useReadOnlyMode();
  const theme = useTheme();
  
  // ... existing code ...

  const handleCrearPasantias = async () => {
    if (isReadOnly) return;
    // ... existing code ...
  };

  const handleEditarPasantia = async () => {
    if (isReadOnly) return;
    // ... existing code ...
  };

  const handleEliminarPasantia = async (id: number) => {
    if (isReadOnly) return;
    // ... existing code ...
  };

  return (
    <MUI.Container maxWidth="xl">
      <MUI.Box sx={{ mb: 4 }}>
        <MUI.Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            if (!isReadOnly) {
              setOpenDialog(true);
            }
          }}
          disabled={isReadOnly}
          sx={{ borderRadius: 3, boxShadow: 3, bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#115293' } }}
        >
          Nueva Pasantía
        </MUI.Button>
      </MUI.Box>

      <MUI.TableContainer component={MUI.Paper}>
        <MUI.Table>
          {/* ... existing table header ... */}
          <MUI.TableBody>
            {pasantias.map((pasantia) => (
              <MUI.TableRow key={pasantia.id_pas}>
                {/* ... existing table cells ... */}
                <MUI.TableCell>
                  <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                    <MUI.IconButton
                      size="small"
                      onClick={() => {
                        if (!isReadOnly) {
                          setPasantiaToEdit(pasantia);
                          setOpenEditDialog(true);
                        }
                      }}
                      disabled={isReadOnly}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <Edit />
                    </MUI.IconButton>
                    <MUI.IconButton
                      size="small"
                      onClick={() => handleEliminarPasantia(pasantia.id_pas)}
                      disabled={isReadOnly}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <Delete />
                    </MUI.IconButton>
                  </MUI.Box>
                </MUI.TableCell>
              </MUI.TableRow>
            ))}
          </MUI.TableBody>
        </MUI.Table>
      </MUI.TableContainer>

      {/* Diálogo de creación */}
      <MUI.Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <MUI.DialogTitle>Nueva Pasantía</MUI.DialogTitle>
        <MUI.DialogContent>
          {/* ... existing form fields ... */}
        </MUI.DialogContent>
        <MUI.DialogActions>
          <MUI.Button onClick={handleCloseDialog}>
            Cancelar
          </MUI.Button>
          <MUI.Button
            variant="contained"
            onClick={handleCrearPasantias}
            disabled={isReadOnly || loading}
          >
            Crear
          </MUI.Button>
        </MUI.DialogActions>
      </MUI.Dialog>

      {/* Diálogo de edición */}
      <MUI.Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <MUI.DialogTitle>Editar Pasantía</MUI.DialogTitle>
        <MUI.DialogContent>
          {/* ... existing form fields ... */}
        </MUI.DialogContent>
        <MUI.DialogActions>
          <MUI.Button onClick={handleCloseEditDialog}>
            Cancelar
          </MUI.Button>
          <MUI.Button
            variant="contained"
            onClick={handleEditarPasantia}
            disabled={isReadOnly || loading}
          >
            Actualizar
          </MUI.Button>
        </MUI.DialogActions>
      </MUI.Dialog>
    </MUI.Container>
  );
}

export default PasantiaPage; 