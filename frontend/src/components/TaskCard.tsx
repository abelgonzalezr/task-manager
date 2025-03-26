import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  MenuItem, 
  Select, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Chip, 
  SelectChangeEvent,
  IconButton,
  Divider,
  CardActions,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Task, TaskStatus } from '../types/task';
import { updateTask, deleteTask } from '../services/taskService';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: () => void;
  onTaskDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate, onTaskDelete }) => {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'info';
      case TaskStatus.IN_PROGRESS:
        return 'warning';
      case TaskStatus.COMPLETED:
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleStatusChange = async (event: SelectChangeEvent) => {
    const newStatus = event.target.value as TaskStatus;
    setStatus(newStatus);
    
    try {
      await updateTask(task.id, { status: newStatus });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task.id);
      setOpenDeleteDialog(false);
      onTaskDelete();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <>
      <Card 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          boxShadow: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${status === TaskStatus.COMPLETED ? '#4caf50' : status === TaskStatus.IN_PROGRESS ? '#ff9800' : '#e0e0e0'}`,
          borderLeft: `5px solid ${status === TaskStatus.COMPLETED ? '#4caf50' : status === TaskStatus.IN_PROGRESS ? '#ff9800' : '#2196f3'}`,
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                mb: 1,
                textDecoration: status === TaskStatus.COMPLETED ? 'line-through' : 'none',
                color: status === TaskStatus.COMPLETED ? 'text.secondary' : 'text.primary',
                fontWeight: 'medium',
              }}
            >
              {task.title}
            </Typography>
            <Chip 
              label={getStatusLabel(task.status)} 
              color={getStatusColor(task.status) as any} 
              size="small" 
              sx={{ ml: 1, fontWeight: 'medium' }}
            />
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
              height: '4.5em',
              opacity: status === TaskStatus.COMPLETED ? 0.7 : 1
            }}
          >
            {task.description}
          </Typography>
          
          <Box display="flex" alignItems="center" sx={{ mt: 'auto', mb: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
            <Typography variant="caption">
              Created: {formatDate(task.created_at)}
            </Typography>
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ p: 2, pt: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Select
            value={status}
            onChange={handleStatusChange}
            size="small"
            sx={{ 
              minWidth: 130, 
              height: 36,
              '& .MuiSelect-select': {
                fontSize: '0.875rem',
              }
            }}
          >
            <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
            <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
            <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
          </Select>
          
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              onClick={handleDeleteClick}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        disablePortal={false}
        disableEnforceFocus={false}
        disableAutoFocus={false}
        hideBackdrop={false}
        aria-modal="true"
        container={document.body}
        role="dialog"
        keepMounted={false}
      >
        <DialogTitle>
          Delete Task
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskCard; 