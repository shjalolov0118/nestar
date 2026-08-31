import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { MemberResolver } from './member.resolver';

jest.mock('stream/promises', () => ({ pipeline: jest.fn().mockResolvedValue(undefined) }));
jest.mock('fs', () => ({
	...jest.requireActual<typeof import('fs')>('fs'),
	createWriteStream: jest.fn(() => ({})),
}));
jest.mock('fs/promises', () => ({
	...jest.requireActual<typeof import('fs/promises')>('fs/promises'),
	unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('MemberResolver image upload', () => {
	const resolver = new MemberResolver({} as never);
	const file = () => ({
		filename: 'home.jpg',
		mimetype: 'image/jpeg',
		encoding: '7bit',
		createReadStream: () => Readable.from('image'),
	});

	beforeEach(() => jest.clearAllMocks());

	it('returns every uploaded image URL', async () => {
		const result = await resolver.imagesUploader(
			[Promise.resolve(file()), Promise.resolve(file())] as never,
			'property',
		);

		expect(result).toHaveLength(2);
		expect(result.every((url) => url.startsWith('uploads/property/'))).toBe(true);
		expect(pipeline).toHaveBeenCalledTimes(2);
	});

	it('rejects an upload target outside the allowlist', async () => {
		await expect(resolver.imagesUploader([Promise.resolve(file())] as never, '../outside')).rejects.toThrow(
			'Bad Request',
		);
		expect(pipeline).not.toHaveBeenCalled();
	});
});
