import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Youtube, Instagram, Facebook, MessageSquare, Play, Video, Settings, Star, TrendingUp, User, Eye, Heart, Clock, Award, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useFirebaseServices } from "@/hooks/use-firebase-realtime";
import { useAuth } from "@/hooks/use-auth";

// Enhanced form schema with all required fields
const channelSubmissionSchema = z.object({
  title: z.string().min(1, "Channel name is required"),
  serviceUrl: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  serviceName: z.string().min(1, "Service name is required"),
  serviceType: z.enum(['youtube', 'instagram', 'facebook', 'telegram', 'reels', 'video', 'tools', 'other'], {
    required_error: "Please select a service type"
  }),
  followersCount: z.number().min(1, "Followers/subscribers count is required"),
  category: z.string().min(1, "Category is required"),
  monetizationStatus: z.enum(['monetized', 'non_monetized'], {
    required_error: "Please select monetization status"
  }),
  reputation: z.enum(['new', '1_strike', '2_strikes', '3_strikes'], {
    required_error: "Please select reputation level"
  }),
  trustedLevel: z.number().min(1).max(5, "Trusted level must be between 1-5"),
  screenshots: z.array(z.string()).max(5, "Maximum 5 screenshots allowed"),
  realPrice: z.number().min(1, "Real price is required"),
  marketingPrice: z.number().optional(),
  customCategory: z.string().optional(),
  customServiceType: z.string().optional(),
  deliveryMethod: z.enum(['chat', 'call', 'conference_call', 'whatsapp_video'], {
    required_error: "Please select delivery method"
  }),
  paymentSystem: z.enum(['upi', 'bank', 'crypto_usd'], {
    required_error: "Please select payment system"
  }),
});

type ChannelSubmissionForm = z.infer<typeof channelSubmissionSchema>;

// Service type options with icons
const serviceTypes = [
  { value: 'youtube', label: 'YouTube', icon: Youtube, followers: 'Subscribers' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, followers: 'Followers' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, followers: 'Followers' },
  { value: 'telegram', label: 'Telegram', icon: MessageSquare, followers: 'Members' },
  { value: 'reels', label: 'Reels Bundle', icon: Play, followers: 'Followers' },
  { value: 'video', label: 'Video Services', icon: Video, followers: 'Followers' },
  { value: 'tools', label: 'Tools', icon: Settings, followers: 'Users' },
  { value: 'other', label: 'Other/Custom', icon: Star, followers: 'Followers' },
];

// 20+ predefined categories
const categories = [
  'Tech & Technology', 'Cooking & Food', 'Entertainment', 'Fun & Comedy', 'Gaming',
  'Health & Fitness', 'Lifestyle', 'Travel', 'Education', 'Music', 'Sports',
  'Fashion & Beauty', 'Business & Finance', 'DIY & Crafts', 'News & Politics',
  'Science', 'Art & Design', 'Photography', 'Cars & Automotive', 'Pets & Animals',
  'History & Culture', 'Spirituality', 'Custom Category'
];

// Reputation levels
const reputationLevels = [
  { value: 'new', label: 'New Channel (0 Strikes)', color: 'bg-green-500' },
  { value: '1_strike', label: '1 Strike', color: 'bg-yellow-500' },
  { value: '2_strikes', label: '2 Strikes', color: 'bg-orange-500' },
  { value: '3_strikes', label: '3 Strikes (Final Warning)', color: 'bg-red-500' },
];

// Delivery methods
const deliveryMethods = [
  { value: 'chat', label: 'Chat Support', description: 'Text-based communication' },
  { value: 'call', label: 'Voice Call', description: 'Audio call support' },
  { value: 'conference_call', label: 'Conference Call (Admin + Client + Me)', description: 'Three-way call with admin' },
  { value: 'whatsapp_video', label: 'WhatsApp Video Call', description: 'Video call via WhatsApp' },
];

// Payment systems
const paymentSystems = [
  { value: 'upi', label: 'UPI', description: 'Unified Payments Interface' },
  { value: 'bank', label: 'Bank Transfer', description: 'Direct bank account transfer' },
  { value: 'crypto_usd', label: 'Crypto (USD Only)', description: 'Cryptocurrency payments in USD' },
];

// Auto-thumbnail fetching function based on category
const getAutoThumbnail = (category: string, serviceType: string) => {
  const thumbnailMap: Record<string, string> = {
    'Tech & Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    'Cooking & Food': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    'Entertainment': 'https://images.unsplash.com/photo-1489599687944-2d4b76d5e7b3?w=400',
    'Gaming': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400',
    'Health & Fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'Travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
    'Education': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    'Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    'Fashion & Beauty': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    'Business & Finance': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  };

  return thumbnailMap[category] || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400';
};

export default function ChannelCreation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [autoThumbnail, setAutoThumbnail] = useState<string>('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomService, setShowCustomService] = useState(false);

  const { createService } = useFirebaseServices();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ChannelSubmissionForm>({
    resolver: zodResolver(channelSubmissionSchema),
    defaultValues: {
      trustedLevel: 3,
      screenshots: [],
      reputation: 'new',
    }
  });

  const watchedValues = watch();
  const selectedServiceType = watch('serviceType');
  const selectedCategory = watch('category');
  const realPrice = watch('realPrice');

  // Auto-generate marketing price (3x to 5x of real price)
  useEffect(() => {
    if (realPrice && realPrice > 0) {
      const multiplier = Math.random() * (5 - 3) + 3; // Random between 3-5x
      const marketingPrice = Math.floor(realPrice * multiplier);
      setValue('marketingPrice', marketingPrice);
    }
  }, [realPrice, setValue]);

  // Auto-fetch thumbnail when category changes
  useEffect(() => {
    if (selectedCategory && selectedServiceType) {
      const thumbnail = getAutoThumbnail(selectedCategory, selectedServiceType);
      setAutoThumbnail(thumbnail);
    }
  }, [selectedCategory, selectedServiceType]);

  // Show custom fields based on selection
  useEffect(() => {
    setShowCustomCategory(selectedCategory === 'Custom Category');
  }, [selectedCategory]);

  useEffect(() => {
    setShowCustomService(selectedServiceType === 'other');
  }, [selectedServiceType]);

  // Fixed Firebase submission mutation
  const submitMutation = useMutation({
    mutationFn: async (data: ChannelSubmissionForm) => {
      if (!user) throw new Error('Please login to submit a channel');
      
      const serviceData = {
        title: data.title,
        description: data.description,
        price: data.realPrice,
        fakePrice: data.marketingPrice || data.realPrice * 3,
        category: data.category === 'Custom Category' ? data.customCategory : data.category,
        serviceType: data.serviceType === 'other' ? data.customServiceType : data.serviceType,
        serviceUrl: data.serviceUrl,
        serviceName: data.serviceName,
        followersCount: data.followersCount,
        followerCount: data.followersCount, // For backward compatibility
        monetizationStatus: data.monetizationStatus,
        monetized: data.monetizationStatus === 'monetized', // For backward compatibility
        reputation: data.reputation,
        trustedLevel: data.trustedLevel,
        screenshots: screenshots,
        thumbnail: autoThumbnail,
        seller: user.displayName || user.email || 'Anonymous',
        deliveryMethod: data.deliveryMethod,
        paymentSystem: data.paymentSystem,
        instructorId: user.uid,
        platform: data.serviceType === 'other' ? data.customServiceType : data.serviceType,
        approvalStatus: 'pending',
        status: 'pending',
        blocked: false,
        likes: Math.floor(Math.random() * 400) + 50, // 50-450 likes
        comments: Math.floor(Math.random() * 25) + 5, // 5-30 comments
        views: Math.floor(Math.random() * 8000) + 1000, // 1k-9k views
        rating: (Math.random() * 1 + 4).toFixed(1),
        soldCount: 0,
        engagementRate: (Math.random() * 8 + 2).toFixed(1)
      };
      
      console.log('Submitting to Firebase:', serviceData);
      return await createService(serviceData);
    },
    onSuccess: (result) => {
      console.log('Firebase submission successful:', result);
      toast({
        title: "🎉 Channel Submitted Successfully!",
        description: "Your channel is now under review. Check your profile to see it!",
      });
      
      // Redirect to profile page to see the channel
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Firebase submission error:', error);
      toast({
        title: "❌ Submission Failed",
        description: error?.message || "Please try again later or contact support.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ChannelSubmissionForm) => {
    submitMutation.mutate(data);
  };

  const getSelectedServiceInfo = () => {
    return serviceTypes.find(type => type.value === selectedServiceType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🚀 Channel Submission Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Submit your channel for approval and start earning! 💰
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Provide essential details about your channel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Channel Name */}
                  <div>
                    <Label htmlFor="title">Channel/Service Name *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Enter your channel name"
                      className="mt-1"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Service URL */}
                  <div>
                    <Label htmlFor="serviceUrl">Service URL *</Label>
                    <Input
                      id="serviceUrl"
                      {...register('serviceUrl')}
                      placeholder="https://youtube.com/@yourchannel"
                      className="mt-1"
                    />
                    {errors.serviceUrl && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceUrl.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Service Description *</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Describe your channel and services..."
                      className="mt-1 min-h-[100px]"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Service Title */}
                  <div>
                    <Label htmlFor="serviceName">Service Title *</Label>
                    <Input
                      id="serviceName"
                      {...register('serviceName')}
                      placeholder="Professional YouTube Channel Management"
                      className="mt-1"
                    />
                    {errors.serviceName && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceName.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Type & Platform */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Service Type & Platform
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Service Type */}
                  <div>
                    <Label>Service Type *</Label>
                    <Select 
                      onValueChange={(value) => setValue('serviceType', value as any)}
                      defaultValue={watchedValues.serviceType}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.serviceType && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>
                    )}
                  </div>

                  {/* Custom Service Type */}
                  {showCustomService && (
                    <div>
                      <Label htmlFor="customServiceType">Custom Service Type *</Label>
                      <Input
                        id="customServiceType"
                        {...register('customServiceType')}
                        placeholder="Enter custom service type"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Followers/Subscribers Count */}
                  <div>
                    <Label htmlFor="followersCount">
                      {getSelectedServiceInfo()?.followers || 'Followers'} Count *
                    </Label>
                    <Input
                      id="followersCount"
                      type="number"
                      {...register('followersCount', { valueAsNumber: true })}
                      placeholder="Enter count"
                      className="mt-1"
                    />
                    {errors.followersCount && (
                      <p className="text-red-500 text-sm mt-1">{errors.followersCount.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Advanced Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Category & Status */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Category & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category */}
                  <div>
                    <Label>Service Category *</Label>
                    <Select 
                      onValueChange={(value) => setValue('category', value)}
                      defaultValue={watchedValues.category}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Custom Category */}
                  {showCustomCategory && (
                    <div>
                      <Label htmlFor="customCategory">Custom Category *</Label>
                      <Input
                        id="customCategory"
                        {...register('customCategory')}
                        placeholder="Enter custom category"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Monetization Status */}
                  <div>
                    <Label>Monetization Status *</Label>
                    <Select 
                      onValueChange={(value) => setValue('monetizationStatus', value as any)}
                      defaultValue={watchedValues.monetizationStatus}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select monetization status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monetized">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Monetized
                          </div>
                        </SelectItem>
                        <SelectItem value="non_monetized">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            Non-Monetized
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.monetizationStatus && (
                      <p className="text-red-500 text-sm mt-1">{errors.monetizationStatus.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reputation & Trust */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Reputation & Trust Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reputation */}
                  <div>
                    <Label>Service Reputation *</Label>
                    <Select 
                      onValueChange={(value) => setValue('reputation', value as any)}
                      defaultValue={watchedValues.reputation}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reputation level" />
                      </SelectTrigger>
                      <SelectContent>
                        {reputationLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                              {level.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.reputation && (
                      <p className="text-red-500 text-sm mt-1">{errors.reputation.message}</p>
                    )}
                  </div>

                  {/* Trusted Level */}
                  <div>
                    <Label htmlFor="trustedLevel">Trusted Level (1-5 stars) *</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="trustedLevel"
                        type="number"
                        min="1"
                        max="5"
                        {...register('trustedLevel', { valueAsNumber: true })}
                        className="w-20"
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= (watchedValues.trustedLevel || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {errors.trustedLevel && (
                      <p className="text-red-500 text-sm mt-1">{errors.trustedLevel.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery & Payment */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Delivery & Payment Methods
                  </CardTitle>
                  <CardDescription>
                    How you'll deliver your service and receive payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Delivery Method */}
                  <div>
                    <Label>After Sale - How You'll Deliver Service *</Label>
                    <Select 
                      onValueChange={(value) => setValue('deliveryMethod', value as any)}
                      defaultValue={watchedValues.deliveryMethod}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select delivery method" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex flex-col">
                              <span>{method.label}</span>
                              <span className="text-xs text-gray-500">{method.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.deliveryMethod && (
                      <p className="text-red-500 text-sm mt-1">{errors.deliveryMethod.message}</p>
                    )}
                  </div>

                  {/* Payment System */}
                  <div>
                    <Label>Your Payment System *</Label>
                    <Select 
                      onValueChange={(value) => setValue('paymentSystem', value as any)}
                      defaultValue={watchedValues.paymentSystem}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment system" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentSystems.map((system) => (
                          <SelectItem key={system.value} value={system.value}>
                            <div className="flex flex-col">
                              <span>{system.label}</span>
                              <span className="text-xs text-gray-500">{system.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paymentSystem && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentSystem.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    Pricing & Marketing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Real Price */}
                  <div>
                    <Label htmlFor="realPrice">Real Price (₹) *</Label>
                    <Input
                      id="realPrice"
                      type="number"
                      {...register('realPrice', { valueAsNumber: true })}
                      placeholder="Enter actual price"
                      className="mt-1"
                    />
                    {errors.realPrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.realPrice.message}</p>
                    )}
                  </div>

                  {/* Marketing Price (Auto-calculated) */}
                  {watchedValues.marketingPrice && (
                    <div>
                      <Label>Marketing Price (Auto-calculated)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={`₹${watchedValues.marketingPrice}`}
                          readOnly
                          className="bg-green-50 border-green-200"
                        />
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {Math.round((watchedValues.marketingPrice / realPrice) * 100) / 100}x
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        💡 Smart pricing: 3-5x multiplier for better conversion
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Auto Thumbnail Preview */}
          {autoThumbnail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Auto-Generated Thumbnail Preview
                  </CardTitle>
                  <CardDescription>
                    Thumbnail automatically selected based on your category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <img
                      src={autoThumbnail}
                      alt="Auto-generated thumbnail"
                      className="w-64 h-40 object-cover rounded-lg shadow-md"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Submit for Approval
                </div>
              )}
            </Button>

            <p className="text-gray-600 mt-4">
              🔒 Your submission will be reviewed within 24 hours
            </p>
          </motion.div>
        </form>
      </div>
    </div>
  );
}