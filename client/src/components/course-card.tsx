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
  const displayRating = parseFloat(realTimeRating.toString()); // Ensure rating is between 1.1 and 5.0
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
    <div className="w-[99%] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      {/* Sold Out Overlay */}
      {channelData.soldOut && (
        <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center rounded-2xl">
          <div className="text-center text-white p-6">
            <div className="text-4xl mb-3">✅</div>
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold mb-3">
              SOLD OUT
            </div>
            <p className="text-gray-200 text-sm">This channel is sold out</p>
          </div>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={channelData.thumbnail || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop'}
          alt={channelData.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge - Top Left */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Platform Badge - Top Right */}
        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold">
          {channelData.platform === 'youtube' ? 'Youtube' : 
           channelData.platform === 'instagram' ? 'Instagram' :
           channelData.platform === 'facebook' ? 'Facebook' :
           channelData.platform === 'tiktok' ? 'TikTok' :
           channelData.platform === 'twitter' ? 'Twitter' :
           channelData.platform === 'linkedin' ? 'LinkedIn' :
           channelData.platform === 'telegram' ? 'Telegram' : 'Youtube'}
        </div>

        {/* Monetized Badge - Bottom Left */}
        {channelData.monetizationStatus === 'monetized' && (
          <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold">
            Monetized
          </div>
        )}

        {/* PRO SELLER Badge - Bottom Right */}
        {channelData.bonusBadge && (
          <div className="absolute bottom-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold">
            PRO SELLER
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title and PRO Badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {channelData.title}
          </h3>
          {channelData.bonusBadge && (
            <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold ml-2 flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              PRO
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 text-sm">
            By: <span className="font-semibold text-gray-900">{channelData.seller || 'user name'}</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {channelData.description}
          {channelData.description && channelData.description.length > 100 && (
            <span className="text-purple-600 cursor-pointer ml-1">Read More</span>
          )}
        </p>

        {/* Price Section */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-green-600">₹{channelData.price.toLocaleString()}</span>
          {channelData.fakePrice && channelData.fakePrice > channelData.price && (
            <>
              <span className="text-gray-500 line-through">₹{channelData.fakePrice.toLocaleString()}</span>
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {discountPercentage}% OFF
              </div>
            </>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{finalRating}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{displayLikes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{formatViews(displayViews)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            <span>{realTimeSales} sold</span>
          </div>
        </div>

        {/* Buy Now Button */}
        <Button 
          onClick={() => {
            if (channelData.soldOut) {
              toast({
                title: "Service Sold Out",
                description: "This service is sold out. Please explore other options.",
                variant: "destructive",
              });
              return;
            }
            onBuyNow(channelData);
          }}
          disabled={channelData.soldOut}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mb-4"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Now - ₹{channelData.price.toLocaleString()}
        </Button>

        {/* Action Buttons Row */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleLike}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            Like
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCommentsView(true)}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Comments ({commentCount})
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="mt-4 text-center">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
            This is 100% Trusted Seller ✓ Verified By Admin Received Trusted Badge
          </span>
        </div>
      </div>

      {/* Comments View Modal */}
      {showCommentsView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Comments ({commentCount})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentsView(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {comment.avatar}
                    </div>
                    <span className="font-semibold text-gray-900">{comment.user}</span>
                    <span className="text-xs text-gray-500">{typeof comment.timestamp === 'string' ? comment.timestamp : comment.timestamp.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
            
            {user && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button onClick={handleComment} disabled={!comment.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>Share your thoughts about this channel</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleComment} disabled={!comment.trim()}>
              Post Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Backward compatibility
export const CourseCard = ChannelCard;
