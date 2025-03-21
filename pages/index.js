import { useQuery, gql } from "@apollo/client";
import client from "../lib/apolloClient";

const GET_USERS_WITH_POSTS = gql`
  query {
    users {
      id
      name
      email
      posts {
        id
        title
        content
      }
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_USERS_WITH_POSTS, { client });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Users and Posts</h1>
      <table border="1">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Posts</th>
          </tr>
        </thead>
        <tbody>
          {/* {data && data.users.length > 0 && data.users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <ul>
                  {user.posts.map((post) => (
                    <li key={post.id}>{post.title}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))} */}
        </tbody>
      </table>
    </div>
  );
}
