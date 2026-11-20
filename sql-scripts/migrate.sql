IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(50) NOT NULL,
        [Color] nvarchar(9) NOT NULL,
        [Emoji] nvarchar(16) NOT NULL,
        [SortOrder] int NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE TABLE [Members] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(50) NOT NULL,
        [Color] nvarchar(9) NOT NULL,
        [Emoji] nvarchar(16) NOT NULL,
        [SortOrder] int NOT NULL,
        [IsArchived] bit NOT NULL,
        CONSTRAINT [PK_Members] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE TABLE [RecurringPatterns] (
        [Id] uniqueidentifier NOT NULL,
        [Frequency] nvarchar(10) NOT NULL,
        [Interval] int NOT NULL,
        [EndDate] date NULL,
        [GeneratedUntil] date NOT NULL,
        CONSTRAINT [PK_RecurringPatterns] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE TABLE [Activities] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(120) NOT NULL,
        [Notes] nvarchar(1000) NULL,
        [Date] date NOT NULL,
        [IsDone] bit NOT NULL,
        [DoneAt] datetime2 NULL,
        [CompletedByMemberId] uniqueidentifier NULL,
        [Points] int NOT NULL,
        [CategoryId] uniqueidentifier NULL,
        [RecurringPatternId] uniqueidentifier NULL,
        CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Activities_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Activities_RecurringPatterns_RecurringPatternId] FOREIGN KEY ([RecurringPatternId]) REFERENCES [RecurringPatterns] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE TABLE [ActivityMembers] (
        [ActivityId] uniqueidentifier NOT NULL,
        [MemberId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_ActivityMembers] PRIMARY KEY ([ActivityId], [MemberId]),
        CONSTRAINT [FK_ActivityMembers_Activities_ActivityId] FOREIGN KEY ([ActivityId]) REFERENCES [Activities] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ActivityMembers_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Color', N'Emoji', N'Name', N'SortOrder') AND [object_id] = OBJECT_ID(N'[Categories]'))
        SET IDENTITY_INSERT [Categories] ON;
    EXEC(N'INSERT INTO [Categories] ([Id], [Color], [Emoji], [Name], [SortOrder])
    VALUES (''00000000-0000-0000-0000-000000000001'', N''#FF8A65'', N''🏠'', N''Hem'', 1),
    (''00000000-0000-0000-0000-000000000002'', N''#4DD0E1'', N''🧹'', N''Städ'', 2),
    (''00000000-0000-0000-0000-000000000003'', N''#81C784'', N''🌱'', N''Trädgård'', 3),
    (''00000000-0000-0000-0000-000000000004'', N''#7986CB'', N''🚗'', N''Bil'', 4),
    (''00000000-0000-0000-0000-000000000005'', N''#FFD54F'', N''📚'', N''Skola'', 5),
    (''00000000-0000-0000-0000-000000000006'', N''#F06292'', N''🍽️'', N''Mat'', 6),
    (''00000000-0000-0000-0000-000000000007'', N''#A1887F'', N''⭐'', N''Övrigt'', 7)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Color', N'Emoji', N'Name', N'SortOrder') AND [object_id] = OBJECT_ID(N'[Categories]'))
        SET IDENTITY_INSERT [Categories] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_CategoryId] ON [Activities] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_Date] ON [Activities] ([Date]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_RecurringPatternId] ON [Activities] ([RecurringPatternId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ActivityMembers_MemberId] ON [ActivityMembers] ([MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261120203957_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261120203957_InitialCreate', N'11.0.0');
END;

COMMIT;
GO

