import { SetMetadata } from '@nestjs/common';

export type TAccessable = 'Any' | 'Signedin';

export const Access = (access: TAccessable) => SetMetadata('access', access);
