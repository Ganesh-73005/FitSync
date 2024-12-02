import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import Header from './Header';

interface Post {
  id: string;
  text: string;
  mediaUrl?: string;
  email: string;
  likes: string[];
  comments: { id: string; text: string; email: string; timestamp: number }[];
}

const ProgressSharing = () => {
  const { userSession } = useAuth();
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentingOn, setCommentingOn] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://10.11.146.131:8080/posts');
        if (response.ok) {
          const fetchedPosts: Post[] = await response.json();
          setPosts(fetchedPosts);
          setLoading(false);
        } else {
          setError('Failed to load posts');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Error fetching posts');
      }
    };

    fetchPosts();
    const intervalId = setInterval(fetchPosts, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const createPost = async () => {
    if (!userSession) {
      alert('You must be logged in to create a post');
      return;
    }

    const postData = {
      id: Math.random().toString(36).substr(2, 9), // Generate a random ID
      text,
      mediaUrl,
      email: userSession,
    };

    try {
      const response = await fetch('http://10.11.146.131:8080/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const newPost: Post = await response.json();
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        setText('');
        setMediaUrl('');
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    }
  };

  const likePost = async (post: Post) => {
    if (!userSession) {
      alert('You must be logged in to like a post');
      return;
    }

    try {
      const response = await fetch(`http://10.11.146.131:8080/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userSession }),
      });

      if (response.ok) {
        const updatedPost: Post = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((p) => (p.id === post.id ? updatedPost : p))
        );
      } else {
        alert('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Error liking post');
    }
  };

  const commentOnPost = async (post: Post) => {
    if (!userSession) {
      alert('You must be logged in to comment on a post');
      return;
    }

    try {
      const response = await fetch(`http://10.11.146.131:8080/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText, email: userSession }),
      });

      if (response.ok) {
        const updatedPost: Post = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((p) => (p.id === post.id ? updatedPost : p))
        );
        setCommentText('');
        setCommentingOn(null);
      } else {
        alert('Failed to comment on post');
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
      alert('Error commenting on post');
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.email || ' '}</Text>
      </View>
      {item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
      )}
      <Text style={styles.postText}>{item.text || ''}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity onPress={() => likePost(item)} style={styles.actionButton}>
          <MaterialCommunityIcons
            name={item.likes.includes(userSession || '') ? "heart" : "heart-outline"}
            size={24}
            color={item.likes.includes(userSession || '') ? "#e74c3c" : "#7f8c8d"}
          />
          <Text style={styles.actionText}>{item.likes.length} likes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCommentingOn(item.id)} style={styles.actionButton}>
          <MaterialCommunityIcons name="comment-outline" size={24} color="#7f8c8d" />
          <Text style={styles.actionText}>{item.comments.length} comments</Text>
        </TouchableOpacity>
      </View>
      {item.comments.length > 0 && (
        <View style={styles.commentsContainer}>
          {item.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentEmail}>{comment.email}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return <Text style={styles.loadingText}>Loading posts...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <LinearGradient
      colors={['#f0f8ff', '#e6f3ff', '#d9edff']}
      style={styles.container}
    >
      <Header />
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.createPostContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              value={text}
              onChangeText={setText}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Enter media URL (optional)"
              value={mediaUrl}
              onChangeText={setMediaUrl}
            />
            <TouchableOpacity style={styles.postButton} onPress={createPost}>
              <Text style={styles.postButtonText}>Share Thought</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentingOn !== null}
        onRequestClose={() => setCommentingOn(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => {
                if (commentingOn) {
                  const post = posts.find(p => p.id === commentingOn);
                  if (post) {
                    commentOnPost(post);
                  }
                }
              }}
            >
              <Text style={styles.commentButtonText}>Post Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCommentingOn(null)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  postText: {
    padding: 15,
    fontSize: 16,
    lineHeight: 24,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#7f8c8d',
    fontSize: 14,
  },
  commentsContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  commentItem: {
    marginBottom: 10,
  },
  commentEmail: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#34495e',
  },
  createPostContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#3897f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  commentInput: {
    height: 80,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  commentButton: {
    backgroundColor: '#3897f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProgressSharing;

