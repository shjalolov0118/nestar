import { ObjectId } from 'bson';
import { BadRequestException } from '@nestjs/common';
import { Message } from './enums/common.enum';

export const availableAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];

export const availableOptions = ['propertyBarter', 'propertyRent'];

export const availablePropertySorts = [
	'createdAt',
	'updatedAt',
	'propertyLikes',
	'propertyViews',
	'propertyRank',
	'propertyPrice',
];

export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

/** IMAGE CONFIGURATION **/

/* IMAGE CONFIGURATION */
import { randomUUID } from 'crypto';
import * as path from 'path';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const validImageTargets = ['member', 'property', 'article'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return randomUUID() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	if (target instanceof ObjectId) return target;
	if (typeof target !== 'string' || !ObjectId.isValid(target)) {
		throw new BadRequestException(Message.BAD_REQUEST);
	}
	return new ObjectId(target) as any;
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		as: 'followingData',
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};
