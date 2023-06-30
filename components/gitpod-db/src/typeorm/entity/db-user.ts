/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { PrimaryColumn, Entity, Column, OneToMany, JoinColumn, Index } from "typeorm";
import { User, RoleOrPermission, AdditionalUserData, UserFeatureSettings } from "@gitpod/gitpod-protocol";
import { DBIdentity } from "./db-identity";
import { TypeORM } from "../typeorm";
import { Transformer } from "../transformer";

@Entity()
// on DB but not Typeorm: @Index("ind_lastModified", ["_lastModified"])   // DBSync
export class DBUser implements User {
    @PrimaryColumn(TypeORM.UUID_COLUMN_TYPE)
    id: string;

    @Column({
        ...TypeORM.UUID_COLUMN_TYPE,
        default: "",
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED,
    })
    organizationId?: string;

    @Column("varchar")
    @Index("ind_creationDate")
    creationDate: string;

    @Column({
        default: "",
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED,
    })
    avatarUrl?: string;

    @Column({
        default: "",
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED,
    })
    name?: string;

    @Column({
        default: "",
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED,
    })
    fullName?: string;

    @Column({
        type: "simple-json",
        transformer: (() => {
            return {
                to(value: any): any {
                    return JSON.stringify(value);
                },
                from(value: any): any {
                    try {
                        const obj = JSON.parse(value);
                        if (Array.isArray(obj)) {
                            return obj;
                        }
                    } catch (error) {}
                    // empty by default
                    return [];
                },
            };
        })(),
    })
    emails: User.Email[];

    @OneToMany((type) => DBIdentity, (identity) => identity.user, {
        eager: true,
        cascade: ["insert", "update"], // we do delete on our own
    })
    @JoinColumn()
    identities: DBIdentity[];

    @Column({
        default: false,
    })
    blocked?: boolean;

    @Column({
        type: "simple-json",
        nullable: true,
    })
    featureFlags?: UserFeatureSettings;

    @Column({
        type: "simple-json",
        nullable: true,
    })
    rolesOrPermissions?: RoleOrPermission[];

    @Column({
        default: false,
    })
    markedDeleted?: boolean;

    // TODO CLEANUP DB: delete after all usages have been deleted
    @Column({
        default: false,
    })
    noReleasePeriod?: boolean;

    @Column({
        type: "simple-json",
        nullable: true,
    })
    additionalData?: AdditionalUserData;

    @Column({
        default: "",
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED,
    })
    usageAttributionId?: string;

    @Column({
        default: "",
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED,
    })
    lastVerificationTime?: string;

    @Column({
        default: "",
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED,
    })
    verificationPhoneNumber?: string;
}
