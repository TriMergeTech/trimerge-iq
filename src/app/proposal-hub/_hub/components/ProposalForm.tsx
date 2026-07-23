import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Paper,
  Typography,
  InputBase,
} from '@mui/material';
import { Save, X, FileText, AlignLeft, Tag, DollarSign, Clock } from 'lucide-react';

interface ProposalFormProps {
  onSubmit: (proposal: {
    title: string;
    description: string;
    category: string;
    budget: string;
    timeline: string;
  }) => void;
  onCancel?: () => void;
  initialData?: {
    title: string;
    description: string;
    category: string;
    budget: string;
    timeline: string;
  };
}

export default function ProposalForm({ onSubmit, onCancel, initialData }: ProposalFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [budget, setBudget] = useState(initialData?.budget || '');
  const [timeline, setTimeline] = useState(initialData?.timeline || '');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setBudget(initialData.budget);
      setTimeline(initialData.timeline);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, category, budget, timeline });
    if (!initialData) {
      setTitle('');
      setDescription('');
      setCategory('');
      setBudget('');
      setTimeline('');
    }
  };

  const categories = [
    'Marketing',
    'Technology',
    'Operations',
    'Finance',
    'Human Resources',
    'Product Development',
  ];

  const fieldContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 1.5, md: 2 },
    px: { xs: 2, md: 2.25 },
    py: { xs: 1.7, md: 1.85 },
    borderRadius: '12px',
    bgcolor: 'rgba(20, 25, 57, 0.68)',
    border: '1px solid rgba(128, 139, 208, 0.20)',
    backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012))',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.055), 0 12px 30px rgba(2, 6, 24, 0.16)',
    minHeight: { xs: 78, md: 82 },
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    '&:focus-within': {
      borderColor: 'rgba(139, 121, 255, 0.55)',
      boxShadow:
        '0 0 0 4px rgba(124,92,255,0.13), inset 0 1px 0 rgba(255,255,255,0.07)',
    },
  };

  const multilineFieldContainer = {
    ...fieldContainer,
    alignItems: 'flex-start',
    minHeight: { xs: 132, md: 150 },
  };

  const iconPanel = {
    width: { xs: 42, md: 44 },
    height: { xs: 42, md: 44 },
    flex: '0 0 auto',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '10px',
    bgcolor: 'rgba(108, 91, 246, 0.16)',
    color: '#a996ff',
    border: '1px solid rgba(139, 121, 255, 0.24)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 28px rgba(77, 63, 200, 0.12)',
  };

  const fieldContent = {
    flex: 1,
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
  };

  const fieldLabel = {
    color: '#9da4c3',
    fontFamily: "'Inter', sans-serif",
    fontSize: { xs: '12px', md: '13px' },
    fontWeight: 600,
    lineHeight: 1.2,
  };

  const inputBaseSx = {
    color: '#f4f6ff',
    fontFamily: "'Inter', sans-serif",
    fontSize: { xs: '16px', md: '18px' },
    fontWeight: 600,
    lineHeight: 1.35,
    '& .MuiInputBase-input': {
      px: 0,
      py: 0,
      color: '#f4f6ff',
      height: 'auto',
      '&::placeholder': {
        color: '#f4f6ff',
        opacity: 1,
      },
    },
  };

  const textareaSx = {
    color: '#f4f6ff',
    fontFamily: "'Inter', sans-serif",
    fontSize: { xs: '15px', md: '17px' },
    fontWeight: 600,
    lineHeight: 1.48,
    '& .MuiInputBase-input': {
      px: 0,
      py: 0,
      color: '#f4f6ff',
      minHeight: { xs: '76px', md: '86px' },
      '&::placeholder': {
        color: '#f4f6ff',
        opacity: 1,
      },
    },
  };

  const selectSx = {
    color: '#f4f6ff',
    fontFamily: "'Inter', sans-serif",
    fontSize: { xs: '16px', md: '18px' },
    fontWeight: 600,
    '& .MuiSelect-select': {
      py: 0,
      px: 0,
      color: '#f4f6ff',
      display: 'flex',
      alignItems: 'center',
      minHeight: 'auto',
    },
    '& .MuiSelect-icon': {
      color: '#b6bed8',
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          bgcolor: 'rgba(18, 22, 52, 0.72)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.048), rgba(255, 255, 255, 0.018))',
          borderRadius: '20px',
          border: '1px solid rgba(128, 139, 208, 0.22)',
          backdropFilter: 'blur(22px)',
          boxShadow:
            '0 26px 80px rgba(0, 0, 0, 0.33), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        <Box sx={{ display: 'flex', gap: { xs: 2, md: 2.5 }, alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: { xs: 52, md: 56 },
              height: { xs: 52, md: 56 },
              flex: '0 0 auto',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '12px',
              bgcolor: 'rgba(108, 91, 246, 0.16)',
              color: '#a996ff',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 34px rgba(77,63,200,0.12)',
              border: '1px solid rgba(139, 121, 255, 0.24)',
            }}
          >
            <FileText size={25} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontFamily: "'Inter', sans-serif",
                color: '#f6f7ff',
                fontSize: { xs: '22px', md: '25px' },
                lineHeight: 1.1,
              }}
            >
              Proposal Details
            </Typography>
            <Typography
              sx={{
                mt: 0.9,
                color: '#a9b0cf',
                fontFamily: "'Inter', sans-serif",
                fontSize: { xs: '14px', md: '16px' },
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Update the core information about this proposal.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: { xs: 2.25, md: 2.5 } }}>
          <Box sx={fieldContainer}>
            <Box sx={iconPanel}>
              <FileText size={20} strokeWidth={2.2} />
            </Box>
            <Box sx={fieldContent}>
              <Typography sx={fieldLabel}>Proposal Title *</Typography>
              <InputBase
                placeholder="Website Redesign Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={inputBaseSx}
                required
              />
            </Box>
          </Box>

          <Box sx={multilineFieldContainer}>
            <Box sx={{ ...iconPanel, mt: 0.35 }}>
              <AlignLeft size={20} strokeWidth={2.2} />
            </Box>
            <Box sx={{ ...fieldContent, gap: 1 }}>
              <Typography sx={fieldLabel}>Description *</Typography>
              <InputBase
                placeholder="Complete overhaul of company website with modern design and improved user experience. This includes new branding, responsive design, and enhanced performance."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={textareaSx}
                multiline
                rows={4}
                required
              />
            </Box>
          </Box>

          <Box sx={fieldContainer}>
            <Box sx={iconPanel}>
              <Tag size={20} strokeWidth={2.2} />
            </Box>
            <Box sx={fieldContent}>
              <Typography sx={fieldLabel}>Category *</Typography>
              <TextField
                select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ ...selectSx, width: '100%' }}
                variant="standard"
                required
                InputProps={{ disableUnderline: true }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        mt: 1,
                        bgcolor: '#111633',
                        color: '#f4f6ff',
                        border: '1px solid rgba(128, 139, 208, 0.24)',
                        boxShadow: '0 24px 58px rgba(0,0,0,0.42)',
                        '& .MuiMenuItem-root': {
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'rgba(124,92,255,0.18)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(124,92,255,0.26)',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box sx={fieldContainer}>
            <Box sx={iconPanel}>
              <DollarSign size={20} strokeWidth={2.2} />
            </Box>
            <Box sx={fieldContent}>
              <Typography sx={fieldLabel}>Budget (USD) *</Typography>
              <InputBase
                placeholder="50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                sx={inputBaseSx}
                type="number"
                required
              />
            </Box>
          </Box>

          <Box sx={fieldContainer}>
            <Box sx={iconPanel}>
              <Clock size={20} strokeWidth={2.2} />
            </Box>
            <Box sx={fieldContent}>
              <Typography sx={fieldLabel}>Timeline *</Typography>
              <InputBase
                placeholder="4 months"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                sx={inputBaseSx}
                required
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Save size={20} />}
          sx={{
            minHeight: 60,
            bgcolor: '#5B5CF6',
            color: '#FFFFFF',
            backgroundImage: 'linear-gradient(135deg, #5a55ff 0%, #6c5dff 58%, #7b61ff 100%)',
            '&:hover': {
              bgcolor: '#534ce0',
              boxShadow: '0 22px 56px rgba(91,92,246,0.38), inset 0 1px 0 rgba(255,255,255,0.18)',
            },
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: '16px',
            textTransform: 'none',
            borderRadius: '10px',
            boxShadow: '0 18px 52px rgba(47, 41, 178, 0.34), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          Update Proposal
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outlined"
            startIcon={<X size={20} />}
            onClick={onCancel}
            sx={{
              minHeight: 60,
              borderColor: 'rgba(128, 139, 208, 0.22)',
              color: '#f4f6ff',
              bgcolor: 'rgba(20, 25, 57, 0.58)',
              backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012))',
              '&:hover': {
                borderColor: 'rgba(139, 121, 255, 0.38)',
                bgcolor: 'rgba(255,255,255,0.07)',
              },
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: '16px',
              textTransform: 'none',
              borderRadius: '10px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 12px 34px rgba(0,0,0,0.18)',
            }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}
