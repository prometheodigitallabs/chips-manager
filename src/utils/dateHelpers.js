export const getCurrentDateInfo = () => {
  const now = new Date();
  return {
    month: now.getMonth(), 
    year: now.getFullYear()
  };
};

export const getFormattedDate = () => new Date().toISOString().split('T')[0];