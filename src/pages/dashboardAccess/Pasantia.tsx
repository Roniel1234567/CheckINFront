import { useReadOnlyMode } from '../../hooks/useReadOnlyMode';

function PasantiaPage() {
  const isReadOnly = useReadOnlyMode();
  
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
          startIcon={<Icons.Add />}
          onClick={() => {
            if (!isReadOnly) {
              setOpenDialog(true);
            }
          }}
          disabled={isReadOnly}
          sx={{ mb: 2 }}
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
                  <MUI.IconButton
                    onClick={() => {
                      if (!isReadOnly) {
                        setPasantiaToEdit(pasantia);
                        setOpenEditDialog(true);
                      }
                    }}
                    disabled={isReadOnly}
                  >
                    <Icons.Edit />
                  </MUI.IconButton>
                  <MUI.IconButton
                    onClick={() => handleEliminarPasantia(pasantia.id_pas)}
                    disabled={isReadOnly}
                  >
                    <Icons.Delete />
                  </MUI.IconButton>
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