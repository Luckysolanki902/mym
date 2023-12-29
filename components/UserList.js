// components/UserList.js

import React from 'react';

const UserList = ({ users, onUserSelect }) => {
  return (
    <div>
      <h2>Online Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => onUserSelect(user)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
