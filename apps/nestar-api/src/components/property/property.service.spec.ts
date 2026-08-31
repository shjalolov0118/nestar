import { BadRequestException } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyStatus } from '../../libs/enums/property.enum';

describe('PropertyService', () => {
	const memberService = {
		memberStatsEditor: jest.fn(),
		getMemberData: jest.fn(),
	};
	const viewService = { recordView: jest.fn() };
	let propertyModel: Record<string, jest.Mock>;
	let service: PropertyService;

	beforeEach(() => {
		jest.clearAllMocks();
		propertyModel = {
			create: jest.fn(),
			findByIdAndDelete: jest.fn(),
			findOneAndUpdate: jest.fn(),
			findOne: jest.fn(),
		};
		service = new PropertyService(propertyModel as never, memberService as never, viewService as never);
	});

	it('rolls the property back when member statistics cannot be updated', async () => {
		const created = { _id: 'property-id', memberId: 'member-id' };
		propertyModel.create.mockResolvedValue(created);
		memberService.memberStatsEditor.mockRejectedValue(new Error('stats failed'));
		const exec = jest.fn().mockResolvedValue(created);
		propertyModel.findByIdAndDelete.mockReturnValue({ exec });

		await expect(service.createProperty({} as never)).rejects.toBeInstanceOf(BadRequestException);
		expect(propertyModel.findByIdAndDelete).toHaveBeenCalledWith(created._id);
		expect(exec).toHaveBeenCalled();
	});

	it('persists the status timestamp during an admin update', async () => {
		const updated = { memberId: 'member-id' };
		const exec = jest.fn().mockResolvedValue(updated);
		propertyModel.findOneAndUpdate.mockReturnValue({ exec });
		memberService.memberStatsEditor.mockResolvedValue({});

		await service.updatePropertyByAdmin({ _id: 'property-id', propertyStatus: PropertyStatus.SOLD } as never);

		const update = propertyModel.findOneAndUpdate.mock.calls[0][1];
		expect(update.propertyStatus).toBe(PropertyStatus.SOLD);
		expect(update.soldAt).toBeInstanceOf(Date);
		expect(memberService.memberStatsEditor).toHaveBeenCalledWith({
			_id: updated.memberId,
			targetKey: 'memberProperties',
			modifier: -1,
		});
	});

	it('loads property member data without recording a profile view', async () => {
		const property = { memberId: 'owner-id', propertyViews: 0 };
		const exec = jest.fn().mockResolvedValue(property);
		propertyModel.findOne.mockReturnValue({ lean: () => ({ exec }) });
		memberService.getMemberData.mockResolvedValue({ _id: 'owner-id' });

		const result = await service.getProperty(undefined as never, 'property-id' as never);

		expect(memberService.getMemberData).toHaveBeenCalledWith(property.memberId);
		expect(viewService.recordView).not.toHaveBeenCalled();
		expect(result.memberData).toEqual({ _id: 'owner-id' });
	});
});
