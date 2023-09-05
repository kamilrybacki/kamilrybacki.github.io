import * as React from 'react';

const Button = () => {
  const [count, setCount] = React.useState(0);

  return (
    <button
      onClick={() => setCount(count + 1)}
      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
    >
      {count}
    </button>
  );
};

export default Button;
