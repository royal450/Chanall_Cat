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
        try {
          await navigator.share(shareData);
        } catch (shareError: any) {
          // Silently handle share cancellation
          if (shareError.name === 'AbortError' || shareError.message === 'Share canceled' || shareError.message?.includes('cancel')) {
            console.log('Share cancelled by user');
            return;
          }
          // For actual errors, fallback to copy
          throw shareError;
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋",
          description: "Channel link has been copied to clipboard with your referral code",
        });
      }
    } catch (error: any) {
      // Only show fallback for non-cancellation errors
      if (error.name !== 'AbortError' && !error.message?.includes('cancel')) {
        // Fallback for when share fails
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
    <div 
      className="w-[98%] mx-auto p-[5px] group"
      style={{ height: 'auto' }}
    >
      <div className={`${channelData.bonusBadge 
        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-2xl shadow-amber-200/30' 
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-slate-200/60'} 
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:border-slate-700 
        rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 group overflow-hidden 
        relative backdrop-blur-sm hover:scale-[1.02] transform-gpu`}>
        
        {/* Sold Out Overlay */}
        {channelData.soldOut && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/95 to-teal-500/95 z-20 flex items-center justify-center rounded-3xl backdrop-blur-sm">
            <div className="text-center text-white p-6">
              <div className="text-4xl mb-3">✅</div>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-lg font-bold mb-3 shadow-lg">
                SOLD OUT
              </div>
              <p className="text-emerald-100 text-sm mb-4">This service is sold out 😎</p>
              <p className="text-emerald-200 text-xs">Please explore other amazing services 😎</p>
              <Button 
                disabled 
                className="mt-4 bg-gray-500 cursor-not-allowed text-sm py-2 shadow-md"
              >
                Service Unavailable
              </Button>
            </div>
          </div>
        )}

        {/* Floating Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-3 py-2 rounded-2xl text-sm font-bold animate-bounce shadow-xl border-2 border-white/20">
              <Sparkles className="w-4 h-4 inline mr-1" />
              {discountPercentage}% OFF
            </div>
          </div>
        )}

        {/* Image Section with Enhanced Overlay */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            src={channelData.thumbnail || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop'}
            alt={channelData.title}
            className="w-full h-52 object-cover transition-all duration-700 group-hover:scale-110 filter group-hover:brightness-110"
          />

          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10" />

          {/* Floating Stats Badges */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <div className="flex justify-between items-end">
              <div className="flex items-center space-x-3">
                <div className="bg-black/40 backdrop-blur-lg px-3 py-2 rounded-xl border border-white/20 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold">{displayLikes}</span>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-lg px-3 py-2 rounded-xl border border-white/20 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold">{formatViews(displayViews)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-lg px-3 py-2 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="font-bold text-white">{finalRating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Title Section with Enhanced Styling */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-1 leading-tight">
                {channelData.title}
              </h3>
              {channelData.bonusBadge && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg border border-amber-300 shrink-0 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {channelData.badgeText || "🔥 HOT"}
                </div>
              )}
            </div>

            {/* Service Type & Status Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                <Play className="w-3 h-3" />
                {channelData.serviceType || channelData.category || 'General'}
              </div>
              <div className={`${channelData.monetizationStatus === 'monetized' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                : 'bg-gradient-to-r from-slate-500 to-gray-500'} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1`}>
                <DollarSign className="w-3 h-3" />
                {channelData.monetizationStatus === 'monetized' ? 'Monetized' : 'Non-Monetized'}
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {(channelData.seller || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                      Seller: <span className="text-purple-600 dark:text-purple-400 font-bold">{channelData.seller || 'Unknown'}</span>
                    </span>
                    {channelData.bonusBadge && (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        PRO
                      </div>
                    )}
                  </div>
                  
                  {/* Strike Info */}
                  {channelData.reputation && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStrikeInfo(channelData.reputation).color}`}></div>
                      <span className={`text-xs ${getStrikeInfo(channelData.reputation).textColor}`}>
                        {getStrikeInfo(channelData.reputation).text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {channelData.bonusBadge && (
                <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span>Verified trusted seller with admin badge 😎</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${showFullDescription ? '' : 'line-clamp-3'}`}>
              {channelData.description}
            </p>
            {channelData.description && channelData.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-purple-600 hover:text-purple-700 font-semibold mt-2 text-sm flex items-center gap-1 transition-colors"
              >
                {showFullDescription ? (
                  <>
                    <ChevronRight className="w-4 h-4 rotate-90" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Read More
                  </>
                )}
              </button>
            )}
          </div>

          {/* Stats Grid with Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-3 rounded-xl text-center border border-rose-200/50 dark:border-rose-700/50">
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{displayLikes}</div>
              <div className="text-xs text-rose-500 dark:text-rose-400">Likes</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-xl text-center border border-blue-200/50 dark:border-blue-700/50">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatViews(displayViews)}</div>
              <div className="text-xs text-blue-500 dark:text-blue-400">Views</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-xl text-center border border-emerald-200/50 dark:border-emerald-700/50">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {channelData.followerCount ? formatViews(channelData.followerCount) : '0'}
              </div>
              <div className="text-xs text-emerald-500 dark:text-emerald-400">
                {getFollowerLabel(channelData.serviceType || channelData.category || 'youtube')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-xl text-center border border-amber-200/50 dark:border-amber-700/50">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{commentCount}</div>
              <div className="text-xs text-amber-500 dark:text-amber-400">Comments</div>
            </div>
          </div>

          {/* Pricing Section with Enhanced Design */}
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 p-5 rounded-2xl border-2 border-green-200/50 dark:border-green-700/50 shadow-sm">
            {channelData.fakePrice && channelData.fakePrice > channelData.price ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">₹{channelData.price.toLocaleString()}</span>
                    <span className="text-xl font-bold text-red-500 line-through decoration-red-500 decoration-2 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg">
                      ₹{channelData.fakePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    SAVE {discountPercentage}%
                  </div>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  You save ₹{(channelData.fakePrice - channelData.price).toLocaleString()} with this deal!
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">₹{channelData.price.toLocaleString()}</span>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                  Best Price
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons with Modern Design */}
          <div className="space-y-3">
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
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 text-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative flex items-center justify-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                Buy Now - ₹{channelData.price.toLocaleString()}
                <Sparkles className="w-5 h-5" />
              </div>
            </Button>

            {/* Secondary Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleLike}
                className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-2 border-rose-200 dark:border-rose-700 hover:bg-gradient-to-r hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-900/40 dark:hover:to-pink-900/40 transition-all duration-300 py-3 rounded-xl group"
              >
                <Heart className={`w-4 h-4 mr-2 transition-all duration-300 ${isLiked ? 'fill-current text-red-500 scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-semibold">{displayLikes}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCommentsView(true)}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/40 dark:hover:to-cyan-900/40 transition-all duration-300 py-3 rounded-xl group"
              >
                <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{commentCount}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 transition-all duration-300 py-3 rounded-xl group"
              >
                <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">Share</span>
              </Button>
            </div>
          </div>

          {/* Trust Indicators Footer */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Shield className="w-4 h-4" />
                <span className="font-semibold">Verified</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Award className="w-4 h-4" />
                <span className="font-semibold">Premium</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">Instant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments View Modal - Enhanced */}
      {showCommentsView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Comments</h3>
                  <p className="text-white/80 text-sm">{commentCount} total comments</p>
                </div>
              </div>
              <Button
                onClick={() => setShowCommentsView(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Comments List with Enhanced Styling */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
              {comments.map((comment, index) => (
                <div key={comment.id} className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 p-4 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-slate-900 dark:text-white">{comment.user}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                          {typeof comment.timestamp === 'string' ? comment.timestamp : formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Comment Input */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <div className="flex gap-4">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this channel... 💬"
                  className="flex-1 min-h-[80px] resize-none border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-2xl bg-white dark:bg-slate-800 shadow-sm"
                />
                <Button 
                  onClick={handleComment}
                  disabled={!comment.trim()}
                  className="self-end bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Dialog - Enhanced */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-md rounded-3xl border-2 border-purple-200 dark:border-purple-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Add a Comment
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Share your thoughts about this channel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="min-h-[120px] border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 rounded-2xl"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button
              onClick={() => setShowCommentDialog(false)}
              variant="outline"
              className="rounded-xl border-2 border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleComment}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl"
            >
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
