import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { ClipboardCheck, FileText, Home, Settings, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  draftCount?: number;
  reviewCount?: number;
}

export default function Sidebar({ activeView, onNavigate, draftCount = 0, reviewCount = 0 }: SidebarProps) {
  const menuItems = [
    { id: 'list', label: 'Home', icon: <Home size={20} /> },
    { id: 'generate', label: 'Generate', icon: <Sparkles size={20} /> },
    { id: 'drafts', label: 'Drafts', icon: <FileText size={20} />, count: draftCount },
    { id: 'reviews', label: 'Reviews', icon: <ClipboardCheck size={20} />, count: reviewCount },
  ];

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        bgcolor: '#0b1340',
        background:
          'linear-gradient(180deg, rgba(18,24,74,0.96), rgba(10,16,56,0.98)), radial-gradient(circle at 0% 0%, rgba(124,92,255,0.2), transparent 38%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(142,151,255,0.16)' }}>
        <Box
          component="img"
          src="/assets/trimerge-iq-logo.png"
          alt="TriMerge IQ"
          sx={{
            width: 190,
            maxWidth: '100%',
            display: 'block',
            mb: 1.5,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          Management
        </Typography>
        <Typography
          sx={{
            mt: 0.75,
            color: '#ffffff',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '24px',
            letterSpacing: '0.3px',
            lineHeight: 1.05,
            textShadow: '0 2px 12px rgba(255,255,255,0.12)',
          }}
        >
          Proposal Hub
        </Typography>
      </Box>

      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => onNavigate(item.id)}
              sx={{
                mx: 1,
                borderRadius: '10px',
                border: '1px solid transparent',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                transition: 'all 0.18s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.065)',
                  borderColor: 'rgba(142,151,255,0.16)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                },
                ...(activeView === item.id && {
                  bgcolor: '#2e2bff',
                  backgroundImage: 'linear-gradient(135deg, #5c55ff, #2e2bff 62%, #725cff)',
                  boxShadow: '0 14px 34px rgba(46,43,255,0.32), inset 0 1px 0 rgba(255,255,255,0.22)',
                  '&:hover': {
                    bgcolor: '#2120e0',
                  },
                }),
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <span>{item.label}</span>
                    {'count' in item && (item.count ?? 0) > 0 && (
                      <Box
                        component="span"
                        sx={{
                          minWidth: 22,
                          height: 22,
                          px: 0.75,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '999px',
                          bgcolor: activeView === item.id ? 'rgba(255,255,255,0.18)' : 'rgba(124,92,255,0.24)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {item.count}
                      </Box>
                    )}
                  </Box>
                }
                primaryTypographyProps={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 500,
                  fontSize: '15px',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(142,151,255,0.16)' }}>
        <ListItemButton
          sx={{
            borderRadius: '10px',
            border: '1px solid transparent',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(142,151,255,0.16)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <Settings size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 500,
              fontSize: '15px',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
