import { ToIpfsImageFromCidPipe } from './to-ipfs-image-from-cid.pipe';

describe('ToIpfsImageFromCidPipe', () => {
  it('create an instance', () => {
    const pipe = new ToIpfsImageFromCidPipe();
    expect(pipe).toBeTruthy();
  });
});
