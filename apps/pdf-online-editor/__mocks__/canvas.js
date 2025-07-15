module.exports = {
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      drawImage: jest.fn(),
      fillRect: jest.fn(),
      clearRect: jest.fn(),
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,test'),
  })),
  loadImage: jest.fn(() => Promise.resolve({
    width: 100,
    height: 100,
  })),
};