import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignAPI, donationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  Heart, 
  DollarSign, 
  Calendar, 
  User, 
  Target, 
  Share2, 
  ArrowLeft,
  Loader2,
  CheckCircle
} from 'lucide-react';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState('');
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getCampaign(id);
      setCampaign(response.data);
    } catch (error) {
      setError('Failed to fetch campaign details');
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonation = async () => {
    setDonationError('');

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setDonationError('Please enter a valid donation amount');
      return;
    }

    try {
      setDonationLoading(true);
      await donationAPI.makeDonation({
        campaignId: id,
        amount: parseFloat(donationAmount)
      });
      
      setDonationSuccess(true);
      setDonationAmount('');
      
      // Refresh campaign data to show updated progress
      await fetchCampaign();
      
      // Close dialog after a short delay
      setTimeout(() => {
        setDialogOpen(false);
        setDonationSuccess(false);
      }, 2000);
    } catch (error) {
      setDonationError(error.response?.data?.message || 'Failed to process donation');
    } finally {
      setDonationLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      health: 'bg-red-100 text-red-800',
      education: 'bg-blue-100 text-blue-800',
      disaster: 'bg-orange-100 text-orange-800',
      others: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.others;
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Campaign link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Campaign Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'The campaign you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canDonate = isAuthenticated && user?.role === 'donor' && campaign.status === 'active';
  const isOwner = isAuthenticated && user?.role === 'ngo' && campaign.createdBy._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>

        {/* Campaign Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={getCategoryColor(campaign.category)}>
                    {campaign.category}
                  </Badge>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl mb-2">{campaign.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>by {campaign.createdBy.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {isOwner && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/edit-campaign/${campaign._id}`)}
                  >
                    Edit Campaign
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {campaign.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Campaign Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Raised</span>
                    <span className="font-semibold">
                      {Math.round(campaign.progressPercentage)}% of goal
                    </span>
                  </div>
                  <Progress value={campaign.progressPercentage} className="h-3" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Raised:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(campaign.raisedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goal:</span>
                    <span className="font-semibold">
                      {formatCurrency(campaign.goalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(campaign.goalAmount - campaign.raisedAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Card */}
            {canDonate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Make a Donation</span>
                  </CardTitle>
                  <CardDescription>
                    Support this campaign and make a difference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Heart className="h-4 w-4 mr-2" />
                        Donate Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Make a Donation</DialogTitle>
                        <DialogDescription>
                          Enter the amount you would like to donate to "{campaign.title}"
                        </DialogDescription>
                      </DialogHeader>
                      
                      {donationSuccess ? (
                        <div className="text-center py-6">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-green-700 mb-2">
                            Thank you for your donation!
                          </h3>
                          <p className="text-gray-600">
                            Your contribution of {formatCurrency(parseFloat(donationAmount) || 0)} has been processed successfully.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {donationError && (
                              <Alert variant="destructive">
                                <AlertDescription>{donationError}</AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="space-y-2">
                              <Label htmlFor="amount">Donation Amount</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                  id="amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={donationAmount}
                                  onChange={(e) => setDonationAmount(e.target.value)}
                                  className="pl-10"
                                  min="1"
                                  step="0.01"
                                  disabled={donationLoading}
                                />
                              </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Note:</strong> This is a demo application. No real payment will be processed.
                              </p>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDialogOpen(false)}
                              disabled={donationLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleDonation}
                              disabled={donationLoading}
                            >
                              {donationLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Donate Now'
                              )}
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Login Prompt for Non-authenticated Users */}
            {!isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle>Want to Donate?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Create an account or sign in to support this campaign.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/register')}
                    >
                      Create Account
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NGO Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{campaign.createdBy.name}</p>
                    <p className="text-sm text-gray-600">{campaign.createdBy.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;

