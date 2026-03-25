using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace TriMergeIQ.Pages;

public class ForgotPasswordModel : PageModel
{
    public void OnGet()
    {
    }

    public IActionResult OnPost()
    {
        return RedirectToPage("/CheckEmail");
    }
}
