using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FamiljeKoll.Repository.Migrations;

/// <inheritdoc />
public partial class _20261120203957_InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Categories",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Color = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false),
                Emoji = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                SortOrder = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Categories", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Members",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Color = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false),
                Emoji = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                SortOrder = table.Column<int>(type: "int", nullable: false),
                IsArchived = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Members", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "RecurringPatterns",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Frequency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                Interval = table.Column<int>(type: "int", nullable: false),
                EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                GeneratedUntil = table.Column<DateOnly>(type: "date", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_RecurringPatterns", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Activities",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Title = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                Date = table.Column<DateOnly>(type: "date", nullable: false),
                IsDone = table.Column<bool>(type: "bit", nullable: false),
                DoneAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CompletedByMemberId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Points = table.Column<int>(type: "int", nullable: false),
                CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                RecurringPatternId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Activities", x => x.Id);
                table.ForeignKey(
                    name: "FK_Activities_Categories_CategoryId",
                    column: x => x.CategoryId,
                    principalTable: "Categories",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_Activities_RecurringPatterns_RecurringPatternId",
                    column: x => x.RecurringPatternId,
                    principalTable: "RecurringPatterns",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "ActivityMembers",
            columns: table => new
            {
                ActivityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                MemberId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ActivityMembers", x => new { x.ActivityId, x.MemberId });
                table.ForeignKey(
                    name: "FK_ActivityMembers_Activities_ActivityId",
                    column: x => x.ActivityId,
                    principalTable: "Activities",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_ActivityMembers_Members_MemberId",
                    column: x => x.MemberId,
                    principalTable: "Members",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.InsertData(
            table: "Categories",
            columns: new[] { "Id", "Color", "Emoji", "Name", "SortOrder" },
            values: new object[,]
            {
                { new Guid("00000000-0000-0000-0000-000000000001"), "#FF8A65", "🏠", "Hem", 1 },
                { new Guid("00000000-0000-0000-0000-000000000002"), "#4DD0E1", "🧹", "Städ", 2 },
                { new Guid("00000000-0000-0000-0000-000000000003"), "#81C784", "🌱", "Trädgård", 3 },
                { new Guid("00000000-0000-0000-0000-000000000004"), "#7986CB", "🚗", "Bil", 4 },
                { new Guid("00000000-0000-0000-0000-000000000005"), "#FFD54F", "📚", "Skola", 5 },
                { new Guid("00000000-0000-0000-0000-000000000006"), "#F06292", "🍽️", "Mat", 6 },
                { new Guid("00000000-0000-0000-0000-000000000007"), "#A1887F", "⭐", "Övrigt", 7 }
            });

        migrationBuilder.CreateIndex(
            name: "IX_Activities_CategoryId",
            table: "Activities",
            column: "CategoryId");

        migrationBuilder.CreateIndex(
            name: "IX_Activities_Date",
            table: "Activities",
            column: "Date");

        migrationBuilder.CreateIndex(
            name: "IX_Activities_RecurringPatternId",
            table: "Activities",
            column: "RecurringPatternId");

        migrationBuilder.CreateIndex(
            name: "IX_ActivityMembers_MemberId",
            table: "ActivityMembers",
            column: "MemberId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "ActivityMembers");

        migrationBuilder.DropTable(
            name: "Activities");

        migrationBuilder.DropTable(
            name: "Members");

        migrationBuilder.DropTable(
            name: "Categories");

        migrationBuilder.DropTable(
            name: "RecurringPatterns");
    }
}
