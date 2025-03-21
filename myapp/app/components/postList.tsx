"use client";

import { gql, useQuery, useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";

const GET_POSTS = gql`
  query {
    posts {
      id
      title
      content
    }
  }
`;

const POST_ADDED_SUBSCRIPTION = gql`
  subscription {
    postAdded {
      id
      title
      content
    }
  }
`;

interface Post {
  id: string;
  title: string;
  content: string;
}

export default function Home() {
  const { loading, error, data, refetch } = useQuery<{ posts: Post[] }>(GET_POSTS);
  const [posts, setPosts] = useState<Post[]>(data?.posts || []);

  // Ensure initial data is set only when necessary
  useEffect(() => {
    if (data?.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  // Subscription to new posts
  const { data: subscriptionData } = useSubscription<{ postAdded: Post }>(POST_ADDED_SUBSCRIPTION);

  useEffect(() => {
    if (subscriptionData?.postAdded) {
      console.log("New Post Received:", subscriptionData.postAdded);
      
      setPosts((prevPosts) => [...prevPosts, subscriptionData.postAdded]);
    }
  }, [subscriptionData, refetch]);
  
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900">
          📝 Latest Posts
        </h1>
  
        <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-white">
          <table className="w-full text-sm text-gray-800">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-md uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 text-left">ID</th>
                <th className="py-4 px-6 text-left">Title</th>
                <th className="py-4 px-6 text-left">Content</th>
              </tr>
            </thead>
  
            {/* Table Body */}
            <tbody>
              {posts.map((post, index) => (
                <tr
                  key={post.id}
                  className={`transition-all duration-300 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:scale-[1.02] hover:shadow-md hover:bg-gray-200`}
                >
                  <td className="py-4 px-6 border-b font-mono text-gray-600">{post.id}</td>
                  <td className="py-4 px-6 border-b font-semibold text-gray-900">{post.title}</td>
                  <td className="py-4 px-6 border-b text-gray-700">{post.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
