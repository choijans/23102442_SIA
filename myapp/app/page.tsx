"use client";

import PostList from "./components/postList";
import ApolloProvider from "./components/ApolloProvider";

export default function Home() {
  return (
    <ApolloProvider>
      <div>
        <PostList />
      </div>
    </ApolloProvider>
  );
}
