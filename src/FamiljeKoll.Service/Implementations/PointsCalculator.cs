using FamiljeKoll.Domain.Models;

namespace FamiljeKoll.Service.Implementations;

public static class PointsCalculator
{
    // Every responsible member gets the activity's full points; without members the one who marked it done gets them.
    public static List<Dtos.MemberPointsDto> Calculate(IEnumerable<Activity> completed)
    {
        var totals = new Dictionary<Guid, int>();
        foreach (var a in completed.Where(a => a.IsDone && a.Points > 0))
        {
            var receivers = a.Members.Count > 0
                ? a.Members.Select(m => m.MemberId)
                : a.CompletedByMemberId is { } id ? [id] : [];
            foreach (var r in receivers)
                totals[r] = totals.GetValueOrDefault(r) + a.Points;
        }
        return totals.Select(kv => new Dtos.MemberPointsDto(kv.Key, kv.Value)).OrderByDescending(p => p.Points).ToList();
    }
}
