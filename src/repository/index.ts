import {
    checkDBExists
} from '@/utils/dbHelper'

export type { Group, Feed, Item } from './model';

export { groupRepo, feedRepo, itemRepo, type Page } from './repository'

export async function isDbExists(): Promise<any> {
    await checkDBExists()
}