import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Target, DollarSign, FileText, Tag, Loader2 } from 'lucide-react';

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goalAmount: ''
  });

  const categories = [
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'disaster', label: 'Disaster Relief' },
    { value: 'others', label: 'Others' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value
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
      setLoading(true);
      const campaignData = {
        ...formData,
        goalAmount: parseFloat(formData.goalAmount)
      };
      
      const response = await campaignAPI.createCampaign(campaignData);
      navigate(`/campaign/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
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
            <p>Only NGO accounts can create campaigns.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600 mt-2">
            Start a new fundraising campaign to support your cause and make a difference.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Campaign Details</span>
            </CardTitle>
            <CardDescription>
              Provide detailed information about your campaign to attract donors and build trust.
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
                    disabled={loading}
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
                  disabled={loading}
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
                <Select value={formData.category} onValueChange={handleCategoryChange}>
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
                    disabled={loading}
                    min="1"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Set a realistic fundraising goal that will help you achieve your campaign objectives.
                </p>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Tips for a Successful Campaign</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Write a clear, compelling title that explains your cause</li>
                  <li>• Provide detailed information about how funds will be used</li>
                  <li>• Set a realistic and achievable fundraising goal</li>
                  <li>• Choose the most appropriate category for better discoverability</li>
                  <li>• Be transparent about your organization and mission</li>
                </ul>
              </div>
            </CardContent>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/ngo-dashboard')}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Campaign...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCampaign;

