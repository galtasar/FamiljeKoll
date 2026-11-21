using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamiljeKoll.Repository.Migrations;

/// <inheritdoc />
public partial class _20261121225934_RemoveEmoji : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Emoji",
            table: "Members");

        migrationBuilder.DropColumn(
            name: "Emoji",
            table: "Categories");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Emoji",
            table: "Members",
            type: "nvarchar(16)",
            maxLength: 16,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "Emoji",
            table: "Categories",
            type: "nvarchar(16)",
            maxLength: 16,
            nullable: false,
            defaultValue: "");

        migrationBuilder.UpdateData(
            table: "Categories",
            keyColumn: "Id",
            keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
            column: "Emoji",
            value: "🏠");

        migrationBuilder.UpdateData(
            table: "Categories",
            keyColumn: "Id",
            keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
            column: "Emoji",
            value: "🧹");

        migrationBuilder.UpdateData(
            table: "Categories",
            keyColumn: "Id",
            keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
            column: "Emoji",
            value: "🌱");

        migrationBuilder.UpdateData(
            table: "Categories",
            keyColumn: "Id",
            keyValue: new Guid("00000000-0000-0000-0000-000000000004"),
            column: "Emoji",
            value: "🚗");

        migrationBuilder.UpdateData(
            table: "Categories",
            keyColumn: "Id",
            keyValue: new Guid("00000000-0000-0000-0000-000000000005"),
            column: "Emoji",
            value: "📚");

        migrationBuilder.UpdateData(
            table: "Categories",
            keyColumn: "Id",
            keyValue: new Guid("00000000-0000-0000-0000-000000000006"),
            column: "Emoji",
            value: "🍽️");

        migrationBuilder.UpdateData(
            table: "Categories",
            keyColumn: "Id",
            keyValue: new Guid("00000000-0000-0000-0000-000000000007"),
            column: "Emoji",
            value: "⭐");
    }
}
