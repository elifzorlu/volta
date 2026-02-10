import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { customCategoriesService } from '../../../services/voltaService';

const ICON_OPTIONS = [
  'Briefcase', 'Focus', 'Users', 'Search', 'Code', 'Palette', 
  'BookOpen', 'Lightbulb', 'Brain', 'Target', 'Zap', 'Coffee'
];

const COLOR_OPTIONS = [
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#06b6d4' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' }
];

const CustomCategoriesManager = ({ onCategoriesChange }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Briefcase',
    color: '#10b981'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  const loadCategories = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await customCategoriesService?.getAll(user?.id);
      if (!error && data) {
        setCategories(data);
        onCategoriesChange?.(data);
      }
    } catch (error) {
      console.error('Failed to load custom categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    // Validate
    const newErrors = {};
    if (!newCategory?.name?.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (categories?.some(c => c?.name?.toLowerCase() === newCategory?.name?.toLowerCase())) {
      newErrors.name = 'Category name already exists';
    }

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await customCategoriesService?.create(user?.id, newCategory);
      if (!error && data) {
        const updatedCategories = [...categories, data];
        setCategories(updatedCategories);
        onCategoriesChange?.(updatedCategories);
        setNewCategory({ name: '', icon: 'Briefcase', color: '#10b981' });
        setIsAdding(false);
        setErrors({});
      } else {
        setErrors({ submit: error?.message || 'Failed to add category' });
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const { error } = await customCategoriesService?.delete(user?.id, categoryId);
      if (!error) {
        const updatedCategories = categories?.filter(c => c?.id !== categoryId);
        setCategories(updatedCategories);
        onCategoriesChange?.(updatedCategories);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base md:text-lg font-medium text-foreground">
            Custom Focus Categories
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Add your own work types alongside the defaults
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Icon name="Plus" size={16} />
            Add
          </Button>
        )}
      </div>

      {/* Add New Category Form */}
      {isAdding && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g., Deep Work, Meetings, Research"
            value={newCategory?.name}
            onChange={(e) => {
              setNewCategory({ ...newCategory, name: e?.target?.value });
              if (errors?.name) {
                setErrors({ ...errors, name: null });
              }
            }}
            error={errors?.name}
          />

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS?.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setNewCategory({ ...newCategory, icon: iconName })}
                  className={`w-10 h-10 rounded-md flex items-center justify-center transition-all ${
                    newCategory?.icon === iconName
                      ? 'bg-accent text-background border-2 border-accent' :'bg-muted hover:bg-muted/70 border border-border'
                  }`}
                >
                  <Icon name={iconName} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_OPTIONS?.map(color => (
                <button
                  key={color?.value}
                  type="button"
                  onClick={() => setNewCategory({ ...newCategory, color: color?.value })}
                  className={`w-10 h-10 rounded-md transition-all ${
                    newCategory?.color === color?.value
                      ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' :'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color?.value }}
                  title={color?.name}
                />
              ))}
            </div>
          </div>

          {errors?.submit && (
            <p className="text-sm text-red-500">{errors?.submit}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end">
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewCategory({ name: '', icon: 'Briefcase', color: '#10b981' });
                setErrors({});
              }}
              variant="ghost"
              size="sm"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </div>
      )}

      {/* Existing Categories */}
      {categories?.length > 0 ? (
        <div className="space-y-2">
          {categories?.map(category => (
            <div
              key={category?.id}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border hover:border-accent/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${category?.color}20` }}
                >
                  <Icon
                    name={category?.icon}
                    size={18}
                    color={category?.color}
                  />
                </div>
                <span className="text-sm md:text-base font-medium text-foreground">
                  {category?.name}
                </span>
              </div>
              <button
                onClick={() => handleDeleteCategory(category?.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
                title="Delete category"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Inbox" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No custom categories yet</p>
            <p className="text-xs mt-1">Click "Add" to create your first one</p>
          </div>
        )
      )}

      {/* Default Categories Info */}
      <div className="mt-6 p-3 bg-accent/5 rounded-lg border border-accent/20">
        <p className="text-xs text-muted-foreground">
          <Icon name="Info" size={14} className="inline mr-1" />
          Default categories (Creative Work, Analytical/Assignment Work, Studying & Cramming) are always available
        </p>
      </div>
    </div>
  );
};

export default CustomCategoriesManager;