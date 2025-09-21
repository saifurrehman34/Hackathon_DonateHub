import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, donationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Heart, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Users,
  Target,
  BarChart3
} from 'lucide-react';

const NGODashboard = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignsResponse, statsResponse] = await Promise.all([
        campaignAPI.getCampaignsByNGO(user._id),
        donationAPI.getDonationStats()
      ]);
      
      setCampaigns(campaignsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignAPI.deleteCampaign(campaignId);
        setCampaigns(campaigns.filter(c => c._id !== campaignId));
        // Refresh stats after deletion
        const statsResponse = await donationAPI.getDonationStats();
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign');
      }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your campaigns and track donations.</p>
          </div>
          <Link to="/create-campaign">
            <Button className="mt-4 md:mt-0">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Campaign
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaigns.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Active and closed campaigns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all campaigns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDonations}</div>
                    <p className="text-xs text-muted-foreground">
                      Individual contributions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.averageDonation)}</div>
                    <p className="text-xs text-muted-foreground">
                      Per contribution
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Campaigns List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Campaigns</CardTitle>
                <CardDescription>
                  Manage and track the performance of your fundraising campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{campaign.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2">
                                  {campaign.description}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Badge className={getCategoryColor(campaign.category)}>
                                  {campaign.category}
                                </Badge>
                                <Badge className={getStatusColor(campaign.status)}>
                                  {campaign.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className="text-sm text-gray-500">Progress</p>
                                <div className="flex items-center space-x-2">
                                  <Progress 
                                    value={campaign.progressPercentage} 
                                    className="flex-1 h-2" 
                                  />
                                  <span className="text-sm font-medium">
                                    {Math.round(campaign.progressPercentage)}%
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Raised / Goal</p>
                                <p className="font-semibold">
                                  {formatCurrency(campaign.raisedAmount)} / {formatCurrency(campaign.goalAmount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-medium">
                                  {new Date(campaign.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 lg:ml-4">
                            <Link to={`/campaign/${campaign._id}`}>
                              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                                View Details
                              </Button>
                            </Link>
                            <Link to={`/edit-campaign/${campaign._id}`}>
                              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full lg:w-auto text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteCampaign(campaign._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first campaign to start raising funds for your cause.
                    </p>
                    <Link to="/create-campaign">
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Your First Campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Donations */}
            {stats && stats.recentDonations && stats.recentDonations.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>
                    Latest donations received across all your campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentDonations.slice(0, 5).map((donation) => (
                      <div key={donation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{donation.donorId.name}</p>
                          <p className="text-sm text-gray-600">{donation.campaignId.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(donation.amount)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(donation.donatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NGODashboard;

