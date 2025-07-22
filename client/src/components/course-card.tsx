import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, MessageCircle, Share2, ShoppingCart, Star, TrendingUp, Award, Users, Calendar, ChevronRight, Sparkles, Clock, ExternalLink, Copy, CheckCircle, Youtube, Instagram, Facebook, Play, Shield, AlertTriangle, DollarSign, User, Send, X, Zap } from "lucide-react";
import { Channel } from "@/types/course";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChannelCardProps {
  channel: Channel;
  onBuyNow: (channel: Channel) => void;
}

// Backward compatibility
interface CourseCardProps {
  channel: Channel;
  onBuyNow: (channel: Channel) => void;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date | string;
  avatar: string;
}

export function ChannelCard({ channel, onBuyNow }: ChannelCardProps) {
  // Backward compatibility support
  const channelData = channel;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(channelData.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [realTimeViews] = useState(channelData.views || Math.floor(Math.random() * 9000) + 1000);
  const [realTimeSales] = useState(channelData.sales || 0);
  const [realTimeRating] = useState(channelData.rating || (Math.random() * 3.9 + 1.1).toFixed(1));
  const [followerCount] = useState(channelData.followerCount || Math.floor(Math.random() * 100000) + 10000);
  const [engagementRate] = useState(channelData.engagementRate || (Math.random() * 8 + 2).toFixed(1));
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentsView, setShowCommentsView] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);


  // Realistic mixed names with 80% Indian names
  const generateRealisticComments = () => {
    const indianNames = [
      "Rajesh Kumar", "Priya Sharma", "Anita Patel", "Sunita Singh", "Kavya Reddy",
      "Neha Gupta", "Ravi Agarwal", "Sanjay Mishra", "Vikram Singh", "Rahul Jain",
      "Arjun Nair", "Kiran Kumar", "Amit Verma", "Deepika Singh", "Rohit Gupta",
      "Sneha Patel", "Manish Kumar", "Pooja Sharma", "Aakash Jain", "Shreya Reddy",
      "Varun Singh", "Meera Gupta", "Harsh Agarwal", "Nisha Patel", "Kunal Sharma"
    ];

    const internationalNames = [
      "Jennifer Smith", "Michael Johnson", "David Wilson", "Robert Brown", "James Davis",
      "Christopher Lee", "Emily Garcia", "Jessica Miller", "Sarah Anderson", "Amanda Taylor",
      "Maria Rodriguez", "Lisa Thomas"
    ];

    // 80% Indian comments in Hinglish, 20% international
    const indianComments = [
      "Yaar ye channel ekdam mast hai! 🔥", "Bhai sahab amazing channel hai, paisa vasool!",
      "Best channel ever yaar! Highly recommend karta hun", "Superb quality hai bro, bahut followers mila",
      "Value for money ka matlab ye channel hai", "Beginners aur experts dono ke liye perfect",
      "Mind-blowing engagement rate hai bro", "Ye to pure sona hai audience wise",
      "Growth potential ekdam top class hai", "Results pakke hain agar properly manage karo",
      "Top-notch quality content already hai", "Business ke liye game-changer hai ye channel",
      "Incredible followers count hai bhai", "Serious buyers ke liye must-purchase",
      "Bilkul different niche hai growth ka", "Exceptional quality engagement hai channel mein",
      "Kamaal ka channel hai yaar! 🚀", "Paisa double ho gaya is channel se",
      "Seller bhai ka management amazing hai", "Life changing opportunity mila hai",
      "Bas kar diya buy after seeing stats", "Ekdum solid channel hai bhai log"
    ];

    const internationalComments = [
      "This channel changed my business! 🔥", "Amazing engagement, worth every penny",
      "Best channel ever! Highly recommended", "Superb quality, great follower base",
      "Outstanding value for money", "Perfect for beginners and experts",
      "Mind-blowing engagement rate here", "This is pure gold audience"
    ];

    const timeStamps = [
      "अभी अभी", "2 min ago", "15 min ago", "1 घंटा ago", "3 hours ago",
      "5 घंटे ago", "1 दिन ago", "2 days ago", "3 दिन ago", "1 हफ्ता ago"
    ];

    const count = Math.floor(Math.random() * 25) + 5; // 5-30 comments
    const generatedComments = [];

    for (let i = 0; i < count; i++) {
      const isIndian = Math.random() < 0.8; // 80% Indian comments
      const name = isIndian ? 
        indianNames[Math.floor(Math.random() * indianNames.length)] :
        internationalNames[Math.floor(Math.random() * internationalNames.length)];

      const comment = isIndian ?
        indianComments[Math.floor(Math.random() * indianComments.length)] :
        internationalComments[Math.floor(Math.random() * internationalComments.length)];

      generatedComments.push({
        id: `auto_${i}`,
        user: name,
        text: comment,
        timestamp: timeStamps[Math.floor(Math.random() * timeStamps.length)],
        avatar: name.split(' ').map(n => n[0]).join('')
      });
    }

    setComments(generatedComments);
    setCommentCount(count);

    // Store comments in localStorage to prevent regeneration
    localStorage.setItem(`comments_${channelData.id}`, JSON.stringify(generatedComments));
  };

  useEffect(() => {
    // Check if user has liked this channel before
    const savedLikeState = localStorage.getItem(`liked_${channelData.id}`);
    if (savedLikeState) {
      setIsLiked(savedLikeState === 'true');
    }

    // Generate comments only once and store in localStorage
    const savedComments = localStorage.getItem(`comments_${channelData.id}`);
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      setComments(parsedComments);
      setCommentCount(parsedComments.length);
    } else {
      generateRealisticComments();
    }
  }, [channelData.id]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 300) { // 5 minutes
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else {
      return "5 min ago";
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like channels",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState ? likes + 1 : likes - 1;

      setIsLiked(newLikedState);
      setLikes(newLikesCount);

      // Store like state in localStorage to persist across refreshes
      localStorage.setItem(`liked_${channelData.id}`, newLikedState.toString());

      // Update Firebase database with real-time like count
      const { ref, update } = await import("firebase/database");
      const { database } = await import("@/lib/firebase");

      await update(ref(database, `channels/${channelData.id}`), {
        likes: newLikesCount
      });

      toast({
        title: newLikedState ? "Added to likes! ❤️" : "Removed from likes ❤️",
        description: newLikedState ? "Channel added to your likes" : "Channel removed from your likes",
      });
    } catch (error) {
      console.error("Error liking channel:", error);
      toast({
        title: "Error",
        description: "Failed to like channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/channel/${channelData.id}?ref=${user?.uid || 'guest'}`;
      const shareData = {
        title: channelData.title,
        text: `Check out this amazing channel: ${channelData.title} - Only ₹${channelData.price}`,
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋",
          description: "Channel link has been copied to clipboard with your referral code",
        });
      }
    } catch (error) {
      // Fallback for when share is cancelled or fails
      const shareUrl = `${window.location.origin}/channel/${channelData.id}?ref=${user?.uid || 'guest'}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋", 
          description: "Channel link has been copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Share Ready! 📤",
          description: "Use the share button to share this channel",
        });
      }
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: user?.displayName || user?.email || "Anonymous",
      text: newComment,
      timestamp: new Date(),
      avatar: (user?.displayName || user?.email || "A").charAt(0).toUpperCase()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");

    toast({
      title: "Comment Added! 💬",
      description: "Your comment has been posted successfully",
    });
  };

    const handleComment = () => {
    if (!comment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      user: user?.displayName || user?.email || "Anonymous",
      text: comment,
      timestamp: new Date(),
      avatar: (user?.displayName || user?.email || "A").charAt(0).toUpperCase()
    };

    const updatedComments = [newCommentObj, ...comments];
    setComments(updatedComments);
    setCommentCount(updatedComments.length);
    setComment("");
    setShowCommentDialog(false);

    // Store updated comments in localStorage
    localStorage.setItem(`comments_${channelData.id}`, JSON.stringify(updatedComments));

    toast({
      title: "Comment Added! 💬",
      description: "Your comment has been posted successfully",
    });
  };

  // Calculate automatic discount percentage if fake price exists
  const calculateDiscountPercentage = () => {
    if (channelData.fakePrice && channelData.fakePrice > channelData.price) {
      return Math.round(((channelData.fakePrice - channelData.price) / channelData.fakePrice) * 100);
    }
    return channelData.discount || 0;
  };

  const discountPercentage = calculateDiscountPercentage();
  const discountedPrice = channelData.finalPrice || (channelData.discount ? channelData.price - (channelData.price * channelData.discount / 100) : channelData.price);

  // Use real-time data with consistent values (no random regeneration)
  const displayLikes = likes; // Use real-time likes from state
  const displaySales = realTimeSales; // Use consistent sales value
  const displayViews = realTimeViews; // Use consistent views value
  const displayRating = parseFloat(realTimeRating); // Ensure rating is between 1.1 and 5.0
  const finalRating = Math.min(Math.max(displayRating, 1.1), 5.0);

  // Get service type specific follower label
  const getFollowerLabel = (serviceType: string) => {
    switch(serviceType) {
      case 'youtube': return 'Subscribers';
      case 'instagram': return 'Followers';
      case 'facebook': return 'Followers'; 
      case 'telegram': return 'Members';
      case 'reels': return 'Followers';
      case 'video': return 'Followers';
      case 'tools': return 'Users';
      default: return 'Followers';
    }
  };

  // Get strike color and text
  const getStrikeInfo = (reputation: string) => {
    switch(reputation) {
      case 'new': return { color: 'bg-green-500', text: '0 Strikes', textColor: 'text-green-700' };
      case '1_strike': return { color: 'bg-yellow-500', text: '1 Strike', textColor: 'text-yellow-700' };
      case '2_strikes': return { color: 'bg-orange-500', text: '2 Strikes', textColor: 'text-orange-700' };
      case '3_strikes': return { color: 'bg-red-500', text: '3 Strikes', textColor: 'text-red-700' };
      default: return { color: 'bg-gray-500', text: 'Unknown', textColor: 'text-gray-700' };
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${Math.floor(views / 1000000)}M`;
    if (views >= 1000) return `${Math.floor(views / 1000)}K`;
    return views.toString();
  };

    return (
    <div className={`${channelData.bonusBadge 
      ? 'bg-gradient-to-br from-yellow-50 via-amber-50/80 to-orange-50/60 border-2 border-yellow-300/60 shadow-2xl shadow-yellow-200/40' 
      : 'bg-gradient-to-br from-white via-purple-50/30 to-cyan-50/30 border border-purple-200/50'} 
      dark:from-gray-800 dark:via-purple-900/30 dark:to-cyan-900/30 dark:border-purple-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative`}>
      {/* Sold Out Overlay - Light Green with Positive Vibes */}
      {channelData.soldOut && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/90 to-emerald-500/90 z-20 flex items-center justify-center rounded-2xl">
          <div className="text-center text-white p-4">
            <div className="text-3xl mb-2">✅</div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-lg font-bold mb-2">
              SOLD OUT
            </div>
            <p className="text-green-100 text-sm mb-3">This service is sold out 😎</p>
            <p className="text-green-200 text-xs">Please explore other amazing services 😎</p>
            <Button 
              disabled 
              className="mt-3 bg-gray-500 cursor-not-allowed text-sm py-2"
            >
              Service Unavailable
            </Button>
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 text-xs font-bold animate-pulse shadow-md">
            {discountPercentage}% OFF
          </Badge>
        </div>
      )}

      <div className="relative overflow-hidden">
        <img
          src={channelData.thumbnail || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop'}
          alt={channelData.title}
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Live Stats Overlay */}
        <div className="absolute bottom-2 left-2 right-2 text-white z-10">
          <div className="flex justify-between items-center text-xs opacity-90">
            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <Heart className="w-3 h-3 text-red-400" />
                {displayLikes}
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <Eye className="w-3 h-3 text-blue-400" />
                {formatViews(displayViews)}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-medium">{finalRating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Title with Badge */}
        <div>
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-md font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-1">
              {channelData.title}
            </h3>
            {channelData.bonusBadge && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 text-xs font-bold animate-pulse shadow-md border-0 shrink-0">
                {channelData.badgeText || "🔥 HOT"}
              </Badge>
            )}
          </div>
          {/* Service Type & Monetization Status */}
          <div className="flex items-center gap-2 text-xs mb-1 flex-wrap">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5">
              📱 {channelData.serviceType || channelData.category || 'General'}
            </Badge>
            <Badge variant="outline" className={channelData.monetizationStatus === 'monetized' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' : 'bg-gray-50 text-gray-700 border-gray-200'} style={{ backgroundColor: channelData.monetizationStatus === 'monetized' ? '#fef3c7' : undefined }}>
              {channelData.monetizationStatus === 'monetized' ? '💰 Monetized' : '⏳ Non-Monetized'}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-3 py-2 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {(channelData.seller || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              By: <span className="text-blue-600 dark:text-blue-400 font-semibold">{channelData.seller || 'Unknown'}</span>
            </span>
            {channelData.bonusBadge && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 text-xs animate-pulse border-0">
                ⭐ PRO SELLER
              </Badge>
            )}
          </div>

          {/* Strike Information */}
          {channelData.reputation && (
            <div className="flex items-center gap-1 text-xs mt-1">
              <div className={`w-2 h-2 rounded-full ${getStrikeInfo(channelData.reputation).color}`}></div>
              <span className={getStrikeInfo(channelData.reputation).textColor}>
                {getStrikeInfo(channelData.reputation).text}
              </span>
            </div>
          )}
          {channelData.bonusBadge && (
            <div className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>This person is 100% legit and trusted - received Admin Badge 😎</span>
            </div>
          )}
        </div>

        {/* Description with Read More */}
        <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <p className={`${showFullDescription ? '' : 'line-clamp-2'}`}>
            {channelData.description}
          </p>
          {channelData.description && channelData.description.length > 100 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-purple-600 hover:text-purple-700 font-medium mt-1 text-xs"
            >
              {showFullDescription ? '↑ Read Less' : '↓ Read More'}
            </button>
          )}
        </div>

        {/* Enhanced Stats Grid with More Info */}
        <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{displayLikes}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatViews(displayViews)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
          </div>
        </div>

        {/* Additional Channel Info */}
        <div className="grid grid-cols-2 gap-2 py-1 text-xs">
          <div className="text-center">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {channelData.followerCount ? formatViews(channelData.followerCount) : '0'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {getFollowerLabel(channelData.serviceType || channelData.category || 'youtube')}
            </div>
          </div>
          
        </div>

        {/* Pricing - Attractive Flex Direction */}
        <div className="space-y-2">
          {channelData.fakePrice && channelData.fakePrice > channelData.price ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{channelData.price.toLocaleString()}</span>
              <span className="text-lg font-bold text-red-500 line-through decoration-red-500 decoration-2 bg-red-50 px-2 py-1 rounded">₹{channelData.fakePrice.toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{channelData.price.toLocaleString()}</span>
            </div>
          )}
          {channelData.fakePrice && channelData.fakePrice > channelData.price && (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              💰 Save ₹{(channelData.fakePrice - channelData.price).toLocaleString()} ({discountPercentage}% OFF)
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button 
            onClick={() => {
              if (channelData.soldOut) {
                toast({
                  title: "Service Sold Out 😎",
                  description: "This service is sold out 😎 Please explore other 😎",
                  variant: "destructive",
                });
                return;
              }
              onBuyNow(channelData);
            }}
            disabled={channelData.soldOut}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Now - ₹{channelData.price.toLocaleString()}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className="flex-1 border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/30 transition-all duration-300 text-xs"
            >
              <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-current text-red-500' : ''}`} />
              {displayLikes}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentsView(true)}
              className="flex-1 border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/30 transition-all duration-300 text-xs"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              {commentCount}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 border-green-200 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/30 transition-all duration-300 text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span className="text-xs">Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span className="text-xs">Premium</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span className="text-xs">Instant</span>
          </div>
        </div>
      </div>

      {/* Comments View - Integrated Card Modal */}
      {showCommentsView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold">Comments ({commentCount})</h3>
              </div>
              <Button
                onClick={() => setShowCommentsView(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Comments List with Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.user}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {typeof comment.timestamp === 'string' ? comment.timestamp : formatTimeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex gap-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment here... 💬"
                  className="flex-1 min-h-[60px] resize-none border-purple-200 dark:border-purple-700 focus:border-purple-500"
                />
                <Button 
                  onClick={handleComment}
                  disabled={!comment.trim()}
                  className="self-end bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a Comment</DialogTitle>
            <DialogDescription>
              Share your thoughts about this channel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowCommentDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleComment}>
              Post Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export backward compatibility function at bottom
export function CourseCard({ channel, onBuyNow }: CourseCardProps) {
  return <ChannelCard channel={channel} onBuyNow={onBuyNow} />;
}