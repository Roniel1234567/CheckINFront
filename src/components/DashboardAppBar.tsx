import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';

// Define the props interface with proper types
interface DashboardAppBarProps {
  toggleDrawer: () => void;
}

function DashboardAppBar({ toggleDrawer }: DashboardAppBarProps) {
  const theme = MUI.useTheme();
  
  return (
    <MUI.AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${MUI.alpha('#000', 0.05)}`,
        bgcolor: theme.palette.background.default 
      }}
    >
      <MUI.Toolbar sx={{width: '100%', position: 'relative'}}>
        <MUI.IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer}
          sx={{ margin:0, display: { md: 'none' } }}
        >
          <Icons.Menu />
        </MUI.IconButton>
        <MUI.Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
          Sistema de Gestión de Pasantías CHECKINT IN
        </MUI.Typography>
        <MUI.Box 
          id="userway-container" 
          sx={{ 
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%) scale(0.7)',
            height: '32px',
            width: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </MUI.Toolbar>
    </MUI.AppBar>
  );
}

export default DashboardAppBar;