import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Edit, DollarSign, FileText, Tag, Loader2, ArrowLeft } from 'lucide-react';

const EditCampaign = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goalAmount: '',
    status: ''
  });

  const categories = [
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'disaster', label: 'Disaster Relief' },
    { value: 'others', label: 'Others' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' }
  ];

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getCampaign(id);
      const campaignData = response.data;
      
      // Check if user owns this campaign
      if (campaignData.createdBy._id !== user._id) {
        setError('You are not authorized to edit this campaign');
        return;
      }
      
      setCampaign(campaignData);
      setFormData({
        title: campaignData.title,
        description: campaignData.description,
        category: campaignData.category,
        goalAmount: campaignData.goalAmount.toString(),
        status: campaignData.status
      });
    } catch (error) {
      setError('Failed to fetch campaign details');
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.goalAmount) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.goalAmount <= 0) {
      setError('Goal amount must be greater than 0');
      return;
    }

    if (formData.title.length > 100) {
      setError('Title must be 100 characters or less');
      return;
    }

    if (formData.description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        ...formData,
        goalAmount: parseFloat(formData.goalAmount)
      };
      
      await campaignAPI.updateCampaign(id, updateData);
      navigate(`/campaign/${id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  // Redirect if not NGO
  if (user?.role !== 'ngo') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Only NGO accounts can edit campaigns.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/ngo-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(`/campaign/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaign
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-gray-600 mt-2">
            Update your campaign details to better engage with donors.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Campaign Details</span>
            </CardTitle>
            <CardDescription>
              Make changes to your campaign information. All fields are required.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Campaign Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter a compelling campaign title"
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={saving}
                    maxLength={100}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Campaign Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Campaign Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your campaign, its goals, and how donations will be used..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={saving}
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Campaign Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Select a category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal Amount */}
              <div className="space-y-2">
                <Label htmlFor="goalAmount">Fundraising Goal *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="goalAmount"
                    name="goalAmount"
                    type="number"
                    placeholder="0.00"
                    value={formData.goalAmount}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={saving}
                    min="1"
                    step="0.01"
                  />
                </div>
                {campaign && (
                  <p className="text-sm text-gray-500">
                    Current raised amount: ${campaign.raisedAmount.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Campaign Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Closed campaigns will not accept new donations.
                </p>
              </div>

              {/* Warning for Goal Amount Changes */}
              {campaign && parseFloat(formData.goalAmount) < campaign.raisedAmount && (
                <Alert>
                  <AlertDescription>
                    <strong>Warning:</strong> The new goal amount is less than the amount already raised 
                    (${campaign.raisedAmount.toFixed(2)}). This may confuse donors.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/campaign/${id}`)}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditCampaign;

