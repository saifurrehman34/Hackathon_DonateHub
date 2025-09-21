import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Heart, DollarSign, Calendar, TrendingUp, Eye } from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getDonationHistory();
      setDonations(response.data);
    } catch (error) {
      setError('Failed to fetch donation history');
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
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

  // Calculate statistics
  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const campaignsSupported = new Set(donations.map(d => d.campaignId._id)).size;
  const averageDonation = donations.length > 0 ? totalDonated / donations.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's your donation impact.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDonated)}</div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaigns Supported</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignsSupported}</div>
              <p className="text-xs text-muted-foreground">
                Different causes helped
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donations.length}</div>
              <p className="text-xs text-muted-foreground">
                Individual contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageDonation)}</div>
              <p className="text-xs text-muted-foreground">
                Per contribution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Donation History */}
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>
              Your complete donation history and campaign details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading donation history...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : donations.length > 0 ? (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{donation.campaignId.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {donation.campaignId.description}
                            </p>
                          </div>
                          <Badge className={getCategoryColor(donation.campaignId.category)}>
                            {donation.campaignId.category}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-500">Your Donation</p>
                            <p className="font-semibold text-green-600">{formatCurrency(donation.amount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Campaign Progress</p>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={donation.campaignId.progressPercentage} 
                                className="flex-1 h-2" 
                              />
                              <span className="text-sm font-medium">
                                {Math.round(donation.campaignId.progressPercentage)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Donation Date</p>
                            <p className="font-medium">
                              {new Date(donation.donatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-600">
                          <span>Campaign by: {donation.campaignId.createdBy?.name}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {formatCurrency(donation.campaignId.raisedAmount)} raised of {formatCurrency(donation.campaignId.goalAmount)} goal
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 md:ml-4">
                        <Link to={`/campaign/${donation.campaignId._id}`}>
                          <Button variant="outline" size="sm" className="w-full md:w-auto">
                            <Eye className="h-4 w-4 mr-2" />
                            View Campaign
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No donations yet</h3>
                <p className="text-gray-600 mb-4">
                  Start making a difference by supporting campaigns that matter to you.
                </p>
                <Link to="/">
                  <Button>
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorDashboard;

